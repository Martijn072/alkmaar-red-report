
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SupporterMedia {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  thumbnail_url?: string;
  file_type: 'image' | 'video';
  file_size: number;
  hashtags?: string[];
  caption?: string;
  votes_count: number;
  reports_count: number;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useSupporterMedia = (sortBy: 'recent' | 'popular' = 'recent') => {
  return useQuery({
    queryKey: ['supporter-media', sortBy],
    queryFn: async (): Promise<SupporterMedia[]> => {
      console.log('🔄 Fetching supporter media...');
      
      let query = supabase
        .from('supporter_media')
        .select('*')
        .eq('is_approved', true);
      
      if (sortBy === 'popular') {
        query = query.order('votes_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query.limit(20);
      
      if (error) {
        console.error('❌ Error fetching supporter media:', error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} media items`);
      // Type cast the file_type to ensure it matches our interface
      return (data || []).map(item => ({
        ...item,
        file_type: item.file_type as 'image' | 'video'
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (uploadData: {
      file: File;
      userId: string;
      caption?: string;
      hashtags?: string;
    }) => {
      console.log('📤 Starting media upload...');
      
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('userId', uploadData.userId);
      if (uploadData.caption) formData.append('caption', uploadData.caption);
      if (uploadData.hashtags) formData.append('hashtags', uploadData.hashtags);
      
      // Upload via Edge Function
      const { data, error } = await supabase.functions.invoke('upload-media', {
        body: formData,
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      // Save metadata to Supabase
      const { data: mediaData, error: dbError } = await supabase
        .from('supporter_media')
        .insert({
          user_id: uploadData.userId,
          filename: data.filename,
          original_filename: data.original_filename,
          file_url: data.file_url,
          thumbnail_url: data.thumbnail_url,
          file_type: data.file_type,
          file_size: data.file_size,
          caption: data.caption,
          hashtags: data.hashtags,
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      console.log('✅ Media uploaded and saved:', mediaData);
      return mediaData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supporter-media'] });
    },
  });
};

export const useVoteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (voteData: {
      mediaId: string;
      voteType: 'up' | 'down';
      userId?: string;
      userIdentifier?: string;
    }) => {
      console.log('🗳️ Voting on media:', voteData);
      
      const { data, error } = await supabase
        .from('media_votes')
        .upsert({
          media_id: voteData.mediaId,
          user_id: voteData.userId || null,
          user_identifier: voteData.userIdentifier || null,
          vote_type: voteData.voteType,
        }, {
          onConflict: voteData.userId ? 'media_id,user_id' : 'media_id,user_identifier'
        });
      
      if (error) throw error;
      
      console.log('✅ Vote recorded');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supporter-media'] });
    },
  });
};

export const useReportMedia = () => {
  return useMutation({
    mutationFn: async (reportData: {
      mediaId: string;
      reason: string;
      description?: string;
      reporterUserId?: string;
      reporterIdentifier?: string;
    }) => {
      console.log('🚨 Reporting media:', reportData);
      
      const { data, error } = await supabase
        .from('media_reports')
        .insert({
          media_id: reportData.mediaId,
          reporter_user_id: reportData.reporterUserId || null,
          reporter_identifier: reportData.reporterIdentifier || null,
          reason: reportData.reason,
          description: reportData.description,
        });
      
      if (error) throw error;
      
      console.log('✅ Report submitted');
      return data;
    },
  });
};
