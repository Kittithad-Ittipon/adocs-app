import { FaDocker, FaFacebook, FaGithub } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

const AboutUs = () => {
  const devData = [
    {
      name: "Kittithad Ittipon",
      role: "Software & Infrastructure Developer",
      fbLink: "https://www.facebook.com/a.kittihad",
      gmLink:
        "https://mail.google.com/mail/u/0/?fs=1&to=a.kittithad.ittipon@gmail.com&tf=cm",
      gitLink: "https://github.com/Kittithad-Ittipon",
      docker: "https://hub.docker.com/u/adocsdeploy",
      bg: "/images/a_2.jpg",
    },
    {
      name: "Natthawut Ploenprom",
      role: "Technical Media Creator & API Tester",
      fbLink: "https://www.facebook.com/natthawut.ploenprom.2025",
      gmLink:
        "https://mail.google.com/mail/u/0/?fs=1&to=nat65.pwk@gmail.com&tf=cm",
      bg: "/images/n.jpg",
    },
    {
      name: "Netnapha Wijitkhajee",
      role: "QA Tester & Documentation",
      fbLink: "https://www.facebook.com/netnapha.wijitkhajee",
      gmLink:
        "https://mail.google.com/mail/u/0/?fs=1&to=netnaphawijit4@gmail.com&tf=cm",
      bg: "/images/d.jpg",
    },
  ];

  return (
    <div className="w-[95%] xl:w-[80%] flex justify-start flex-col items-center md:bg-gray-100/35 dark:bg-transparent mt-10 mb-10 rounded-xl py-2">
      <div className="flex items-center mt-5 md:mt-10 xl:mt-12 text-2xl md:text-4xl font-[700] text-black dark:text-white">
        Our Team
      </div>
      <div className="flex items-start text-sm md:text-lg xl:text-lg font-[400] text-gray-500 mt-5 mb-5 text-center px-6">
        The development team behind the Platform for Web Application Deployment
        and Management using Container Technology
      </div>
      <div className="grid grid-cols-1 w-full md:grid-cols-2 xl:grid-cols-3 md:w-[90%] xl:w-[80%] gap-6 mt-5 mb-5">
        {devData.map((value, index) => (
          <div
            className="bg-white dark:bg-transparent w-full border flex flex-col items-center py-15 px-5 rounded-xl group cursor-pointer transition duration-200 hover:border-sky-500/50 hover:shadow hover:-translate-y-1 hover:shadow-lg dark:hover:border-cyan-300/50 dark:hover:shadow-cyan-500/10"
            key={index}
          >
            <div className="w-45 h-45 flex overflow-hidden rounded-full mb-8">
              <div
                className="bg-cover bg-center w-full h-full"
                style={{ backgroundImage: `url('${value.bg}')` }}
              >
                <div className="bg-black/10 dark:bg-black/35 w-full h-full group-hover:bg-transparent dark:group-hover:bg-transparent transition duration-200"></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="font-[700] text-xl mb-1 group-hover:text-sky-500 dark:group-hover:text-white transition duration-200">
                {value.name}
              </div>
              <div className="font-[400] text-sm text-gray-500 pb-5 text-center">
                {value.role}
              </div>
            </div>
            <div className="mt-10 flex gap-6 items-center">
              <a
                href={value.fbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black dark:text-white hover:scale-120 group-hover:text-blue-500 transition duration-200"
              >
                <FaFacebook size={25} />
              </a>
              <a
                href={value.gmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black dark:text-white hover:scale-120 group-hover:text-red-500 transition duration-200"
              >
                <SiGmail size={25} />
              </a>
              {value.gitLink && (
                <a
                  href={value.gitLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black dark:text-white hover:scale-120 group-hover:text-gray-700 transition duration-200"
                >
                  <FaGithub size={25} />
                </a>
              )}
              {value.docker && (
                <a
                  href={value.docker}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black dark:text-white hover:scale-120 group-hover:text-sky-400 transition duration-200"
                >
                  <FaDocker size={27} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AboutUs;
