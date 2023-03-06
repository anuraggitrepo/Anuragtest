pipeline {
    agent any 
    Stages{
        stage(updating){
            script {
            sshpass -p 'Minda00$' ssh  root@52.66.141.192  -p 22 "apt update -y"
                
            }
        }
            
        stage(installing){
            script{
            sshpass -p 'Minda00$' ssh  root@52.66.141.192 -p 22 "apt install vim -y"
            }
        }
        Stage(touch){
            touch txt
        }
    }

}
