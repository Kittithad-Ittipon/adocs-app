import { BiLogoFlask } from "react-icons/bi";
import { FaDocker } from "react-icons/fa";
import { RiTailwindCssFill } from "react-icons/ri";
import { SiLucide, SiNextdotjs, SiNextra } from "react-icons/si";

const PoweredBy = () => {
  const poweredData = [
    {
      icon: (
        <FaDocker className="w-8 h-8 md:w-12 md:h-12 text-blue-500 dark:text-sky-400" />
      ),
      title: "Docker",
      description: "Containerization",
      link: "https://www.docker.com/",
    },
    {
      icon: (
        <SiNextdotjs className="w-8 h-8 md:w-12 md:h-12 text-gray-800 dark:text-gray-100" />
      ),
      title: "Next.js",
      description: "React Framework",
      link: "https://nextjs.org/",
    },
    {
      icon: (
        <BiLogoFlask className="w-10 h-10 md:w-14 md:h-14 text-sky-600 dark:text-cyan-300" />
      ),
      title: "Flask",
      description: "Python Backend",
      link: "https://flask.palletsprojects.com/",
    },
    {
      icon: (
        <RiTailwindCssFill className="w-8 h-8 md:w-14 md:h-14 text-teal-500 dark:text-teal-400" />
      ),
      title: "Tailwind",
      description: "Utility CSS",
      link: "https://tailwindcss.com/",
    },
    {
      icon: (
        <SiNextra className="w-8 h-8 md:w-11 md:h-11 text-slate-800 dark:text-slate-300" />
      ),
      title: "Nextra",
      description: "Documentation",
      link: "https://nextra.site/",
    },
    {
      icon: (
        <SiLucide className="w-8 h-8 md:w-12 md:h-12 text-rose-500 dark:text-orange-500" />
      ),
      title: "Lucide",
      description: "Icon Library",
      link: "https://lucide.dev/",
    },
  ];

  return (
    <div className="w-[95%] xl:w-[80%] flex justify-start flex-col items-center mt-10 mb-10 rounded-xl py-2">
      <div className="flex items-center mt-5 md:mt-10 xl:mt-12 text-xl md:text-3xl font-[700] bg-[linear-gradient(to_right,#0ea5e9,#67e8f9,#818cf8,#0ea5e9)] bg-clip-text text-transparent animate-rgb">
        Powered By
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 w-full mt-15 gap-6">
        {poweredData.map((value, index) => (
          <a
            key={index}
            className="flex justify-start items-center gap-2 flex-col cursor-pointer border py-4 px-3 rounded-xl group transition duration-200 hover:border-sky-500/50 hover:shadow hover:-translate-y-1 hover:shadow-lg dark:hover:border-cyan-300/50 dark:hover:shadow-cyan-500/10"
            href={value.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-18 h-18 flex justify-center items-center transition duration-200">
              {value.icon}
            </div>
            <div className="font-[600] text-md md:text-lg">{value.title}</div>
            <div className="text-gray-500 font-[500] text-sm md:text-md">
              {value.description}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
export default PoweredBy;
