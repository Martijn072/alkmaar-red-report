import { Facebook, Instagram } from "lucide-react";

// Custom X (Twitter) icon
const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-6 h-6"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  {
    name: "X",
    icon: XIcon,
    url: "https://x.com/azfanpage",
    bgColor: "bg-foreground/10 hover:bg-foreground/20",
    textColor: "text-foreground",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://www.facebook.com/azfanpage",
    bgColor: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20",
    textColor: "text-[#1877F2]",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://www.instagram.com/azfanpagenl",
    bgColor: "bg-[#E4405F]/10 hover:bg-[#E4405F]/20",
    textColor: "text-[#E4405F]",
  },
];

export const InlineFollowWidget = () => {
  return (
    <div className="mt-8 p-5 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-base font-semibold text-foreground">
            Mis geen AZ nieuws
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Volg AZFanpage op social media
          </p>
        </div>
        
        <div className="flex items-center justify-center sm:justify-end gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-full transition-all duration-200 ${social.bgColor} ${social.textColor}`}
              aria-label={`Volg ons op ${social.name}`}
            >
              <social.icon />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
