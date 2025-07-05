
import { Users, Upload, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const CommunitySection = () => {
  const navigate = useNavigate();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="headline-premium text-headline-lg text-az-black dark:text-white font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-az-red" />
          AZ Community
        </h2>
      </div>
      
      <div className="card-premium dark:bg-gray-800 p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4 mb-4">
            <div className="bg-az-red/10 p-3 rounded-full">
              <Upload className="w-6 h-6 text-az-red" />
            </div>
            <div className="bg-az-red/10 p-3 rounded-full">
              <Trophy className="w-6 h-6 text-az-red" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-az-black dark:text-white">
            Deel je AZ momenten!
          </h3>
          
          <p className="text-premium-gray-600 dark:text-gray-300">
            Upload je mooiste AZ foto's en video's, stem op content van andere supporters, 
            en maak kans om "Foto van de Week" te worden!
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {['#AZThuis', '#AZAway', '#AZTraining'].map((tag) => (
              <span
                key={tag}
                className="text-xs bg-az-red/10 text-az-red px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <Button
            onClick={() => navigate('/community')}
            className="bg-az-red hover:bg-red-700 text-white px-6 py-3 text-lg"
          >
            Ga naar Community
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
