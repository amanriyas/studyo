# Team-76
Team Members:
1. Aman Abdul Salam A Riyas aar350@student.bham.ac.uk
2. Heng Cheng hxc313@student.bham.ac.uk
3. Nada alsawad nxa217@student.bham.ac.uk
4. Alagappan Alagappan axa2254@student.bham.ac.uk
5. Fatima Arab fsa257@student.bham.ac.uk
6. Abdulmonem Altarawneh axa2265@student.bham.ac.uk 
7. Yazan Dabaan yxd252@student.bham.ac.uk

## Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/)


### Cloning the Repository
To clone the repository, run the following command:
```bash

git clone https://github.com/uob-team-project/team76.git
cd team76
```

### Installing Dependencies
To download the necessary dependencies, run the following command to build the docker images for development:
```bash
docker compose -f docker-compose.development.yml build
```

### Running the Application
To start the application in development, run the following command:
```bash
docker compose -f docker-compose.development.yml up -d
```

This will start the application and make it accessible at `http://localhost:5173`.

### Stopping the Application
To stop the application, press `Ctrl+C` in the terminal where the application is running.

### Additional Commands
To stop and remove all containers, networks, and volumes created by `docker compose -f docker-compose.development.yml build`, run:
```bash
docker compose -f docker-compose.development.yml down
```
### Please Note
Every time you make changes in the application, please re-run run:
```bash
docker compose -f docker-compose.development.yml build

docker compose -f docker-compose.development.yml up -d
```
in order to reflect the changes.


