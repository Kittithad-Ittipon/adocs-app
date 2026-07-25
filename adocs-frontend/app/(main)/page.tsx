import AboutUs from "@/components/AboutUs";
import ContactUs from "@/components/ContactUs";
import PoweredBy from "@/components/PoweredBy";
import { ArrowRight, ArrowUpRight, Rocket, Settings } from "lucide-react";
import Link from "next/link";
import {
  FaCogs,
  FaDatabase,
  FaDocker,
  FaHtml5,
  FaNodeJs,
  FaPython,
  FaServer,
} from "react-icons/fa";
import { SiPhp } from "react-icons/si";

const Main = () => {
  const featuresData = [
    {
      title: "Deployment",
      description:
        "Deploy your applications quickly and seamlessly with automated workflows.",
      icon: (
        <Rocket className="w-8 h-8 text-sky-500 dark:text-cyan-300 group-hover:text-white dark:group-hover:text-black transition duration-200" />
      ),
      link: "https://hub.docker.com/",
    },
    {
      title: "Docker Containers",
      description:
        "Run and manage isolated environments safely using Docker integration.",
      icon: (
        <FaDocker className="w-8 h-8 text-sky-500 dark:text-cyan-300 group-hover:text-white dark:group-hover:text-black transition duration-200" />
      ),
      link: "https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04",
    },
    {
      title: "Local DNS",
      description:
        "Easily map your internal services with custom local domain names.",
      icon: (
        <FaServer className="w-8 h-8 text-sky-500 dark:text-cyan-300 group-hover:text-white dark:group-hover:text-black transition duration-200" />
      ),
      link: "https://technitium.com/dns/",
    },
    {
      title: "Containers Management",
      description:
        "Take full control to start, stop, publish, or delete your containers.",
      icon: (
        <Settings className="w-8 h-8 text-sky-500 dark:text-cyan-300 group-hover:text-white dark:group-hover:text-black transition duration-200" />
      ),
      link: "https://docs.docker.com/reference/cli/docker/container/",
    },
  ];

  const techStack = [
    {
      title: "HTML",
      description:
        "Jumpstart your static websites with our ready-to-deploy HTML, CSS, and JS templates.",
      icon: (
        <FaHtml5 className="w-10 h-10 text-black dark:text-white group-hover:text-sky-500 dark:group-hover:text-cyan-300 transition duration-200" />
      ),
      link: "https://adocs-document.vercel.app/docs/html",
    },
    {
      title: "Python",
      description:
        "Ready-to-deploy HTML, CSS, and JS templates for static sites.",
      icon: (
        <FaPython className="w-10 h-10 text-black dark:text-white group-hover:text-sky-500 dark:group-hover:text-cyan-300 transition duration-200" />
      ),
      link: "https://adocs-document.vercel.app/docs/python/flask",
    },
    {
      title: "PHP",
      description: "Optimized raw PHP and Laravel templates for dynamic apps.",
      icon: (
        <SiPhp className="w-10 h-10 text-black dark:text-white group-hover:text-sky-500 dark:group-hover:text-cyan-300 transition duration-200" />
      ),
      link: "https://adocs-document.vercel.app/docs/php/php",
    },
    {
      title: "Node.js",
      description:
      "Node.js, Express, and Next.js templates for full-stack deployment.",
      icon: (
        <FaNodeJs className="w-10 h-10 text-black dark:text-white group-hover:text-sky-500 dark:group-hover:text-cyan-300 transition duration-200" />
      ),
      link: "https://adocs-document.vercel.app/docs/nodejs/express",
    },
    {
      title: "Databases",
      description:
      "Ready-made MySQL and PostgreSQL templates for instant database setups.",
      icon: (
        <FaDatabase className="w-10 h-10 text-black dark:text-white group-hover:text-sky-500 dark:group-hover:text-cyan-300 transition duration-200" />
      ),
      link: "https://adocs-document.vercel.app/docs/mysql",
    },
    {
      title: "Management Tools",
      description:
      "Container app to manage entire system. Read the docs to deploy and try it yourself.",
      icon: (
        <FaCogs className="w-10 h-10 text-black dark:text-white group-hover:text-sky-500 dark:group-hover:text-cyan-300 transition duration-200" />
      ),
      link: "https://adocs-document.vercel.app/docs/docker-app",
    },
  ];

  return (
    <main className="w-full min-h-screen flex items-center justify-start flex-col">
      <div className="w-full h-100 md:h-120 xl:h-[calc(100dvh-120px)] bg-[url('/images/w02.webp')] md:bg-[url('/images/w07.jpg')] bg-cover bg-start md:bg-center bg-no-repeat xl:bg-cover flex items-center justify-center overflow-hidden">
        <div className="transition duration-200 w-full h-full bg-black/15 dark:bg-black/45 flex items-center justify-center">
          <div className="w-[95%] xl:w-[80%] h-full flex items-start justify-start flex-col gap-8 xl:gap-11">
            <p className="flex flex-col font-[900] text-4xl md:text-6xl ld:text-6xl xl:text-8xl text-white leading-tight mt-8 xl:mt-10">
              Learn <br />
              Build <br />
              Deploy
            </p>
            <p className="text-white w-[85%] md:w-[65%] xl:w-[55%] text-xs md:text-[17px] xl:text-lg font-[500]">
              Manage containers, launch environments, and deploy websites
              through a user-friendly platform designed for developers. 
            </p>
            <Link
              href="https://adocs-document.vercel.app"
              className="relative w-auto flex font-[700] justify-start items-center text-xl md:text-3xl xl:text-4xl text-white gap-1 transition duration-200 p-2 rounded-xl group"
            >
              Get Started
              <ArrowUpRight size={30} className="flex md:hidden" />
              <ArrowUpRight size={35} className="hidden md:flex xl:hidden" />
              <ArrowUpRight size={40} className="hidden xl:flex" />
              <span className="absolute rounded-xl bottom-0 left-0 w-full h-[5px] bg-gradient-to-r from-sky-500 via-cyan-300 to-violet-500 transform scale-x-0 group-hover:scale-x-100 transition duration-300 origin-left"></span>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-start flex-col items-center">
        <div className="flex items-center mt-10 md:mt-15 xl:mt-20 text-2xl md:text-4xl font-[700] text-sky-500 dark:text-cyan-300">
          Features
        </div>
        <div className="flex items-start text-sm md:text-lg xl:text-lg font-[400] text-gray-500 mt-5 mb-5 text-center px-6">
          Core tools for deploying applications and managing your local
          environment
        </div>
        <div className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 xl:w-[80%] w-[95%] gap-6 mt-5 mb-5">
          {featuresData.map((value, index) => (
            <div
              key={index}
              className="gap-4 group flex flex-col rounded-xl border p-4 cursor-pointer transition duration-200 hover:border-sky-500/50 hover:shadow hover:-translate-y-1 hover:shadow-lg dark:hover:border-cyan-300/50 dark:hover:shadow-cyan-500/10"
            >
              <div className="w-18 h-18 rounded-xl bg-sky-500/10 dark:bg-cyan-300/5 flex items-center justify-center items-center mb-5 transition duration-200 group-hover:bg-sky-500 dark:group-hover:bg-cyan-300">
                {value.icon}
              </div>
              <div className="font-[700] text-xl">{value.title}</div>
              <div className="text-md text-gray-500 border-b pb-4">
                {value.description}
              </div>
              <div className="text-sky-500 font-[500] flex gap-1 items-center text-md group-hover:gap-3 transiton duration-200 dark:text-cyan-300">
                <a href={value.link} target="_blank" rel="noopener noreferrer">
                  Learn More
                </a>
                <ArrowRight size={17} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-[95%] xl:w-[80%] flex justify-start flex-col items-center md:bg-gray-100/35 dark:bg-transparent mt-10 mb-10 rounded-xl py-2">
        <div className="flex items-center mt-5 md:mt-10 xl:mt-12 text-2xl md:text-4xl font-[700] text-black dark:text-white">
          Frameworks & Databases
        </div>
        <div className="flex items-start text-sm md:text-lg xl:text-lg font-[400] text-gray-500 mt-5 mb-5 text-center px-6">
          Deploy a wide range of applications. Here are our officially
          documented stacks
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:w-[90%] xl:w-[80%] gap-6 mt-5 mb-5">
          {techStack.map((value, index) => (
            <div
              key={index}
              className="group border p-4 xl:p-8 rounded-xl bg-white dark:bg-transparent flex flex-col gap-5 cursor-pointer transition duration-200 hover:border-sky-500/50 hover:shadow hover:-translate-y-1 hover:shadow-lg dark:hover:border-cyan-300/50 dark:hover:shadow-cyan-500/10"
            >
              <div>{value.icon}</div>
              <div className="font-[700] text-xl transition duration-200 group-hover:text-sky-500 dark:group-hover:text-cyan-300">
                {value.title}
              </div>
              <div className="text-md text-gray-500 border-b pb-4 md:h-25">
                {value.description}
              </div>
              <div className="text-gray-black font-[500] flex gap-1 items-center text-md group-hover:gap-3 transiton duration-200 dark:text-white group-hover:text-sky-500">
                <a
                  href={value.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read Docs
                </a>
                <ArrowRight size={17} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <AboutUs /> */}
      <ContactUs />
      <PoweredBy />
    </main>
  );
};

export default Main;
