const system_deployment = {
  "start": "",
  "docker-app": "",
  "general": "",
  "feature": {
    items: {
      "active-site": "",
      "require": "",
      "upload": "",
    }
  },
};

const basicItems = {
  "docker-engine": {
    items: {
      "introduction": "",
      "installation": "",
      "commands": {
        items: {
          "docker-img": "",
          "docker-container": "",
          "docker-network": "",
          "docker-storage": "",
          "docker-run": "",
          "docker-compose": "",
        }
      },
    }
  },
  "docker-desktop": "",
};

const techStackItems = {
  html: "",
  php: {
    items: {
      "php": "",
      "laravel": "",
    }
  },
  python: {
    items: {
      "flask": "",
    }
  },
  nodejs: {
    items: {
      express: "",
      next: "",
    }
  },
};

const databaseItems = {
  mysql: "",
  pgsql: "",
};

export default {
  docs: {
    type: "page",
    title: "Documentation",
    theme: {
      copyPage: false,
    },
    items: {
      index: "",
      _1: {
        type: "separator",
        title: "Platform",
      },
      ...system_deployment,
      _2: {
        type: "separator",
        title: "Docker",
      },
      ...basicItems,
      _3: {
        type: "separator",
        title: "Deploy",
      },
      ...techStackItems,
      _4: {
        type: "separator",
        title: "Databases",
      },
      ...databaseItems,
    },
  },
};
