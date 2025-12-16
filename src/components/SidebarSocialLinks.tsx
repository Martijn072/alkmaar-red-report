import { Facebook, Instagram, Youtube } from "lucide-react";

// X (Twitter) icon since lucide doesn't have the new X logo
const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  {
    name: "Twitter",
    icon: XIcon,
    url: "https://twitter.com/azfanpage",
  },
  {
    name: "Facebook", 
    icon: Facebook,
    url: "https://facebook.com/azfanpage",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://instagram.com/azfanpagenl",
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: "https://youtube.com/@azfanpage",
  },
];

export const SidebarSocialLinks = () => {
  return (
    <div className="card-premium p-4">
      <h3 className="font-headline text-lg font-semibold text-foreground mb-4">
        Volg AZFanpage
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg hover:bg-az-red/10 transition-colors group"
          >
            <span className="text-az-red">
              <link.icon />
            </span>
            <span className="text-sm font-medium text-foreground group-hover:text-az-red transition-colors">
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
