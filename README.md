wallet-api
Este é um projeto de aplicação para gerenciamento de carteira, com controle de entradas e saídas.

Ajustes e melhorias
O projeto ainda está em desenvolvimento e as próximas atualizações serão voltadas para as seguintes tarefas:

 Tratamento de erros, com resposta explicativa para cada tipo de erro ocorrido
 Criação de grupos de despesas e entradas

💻 Pré-requisitos
Antes de começar, verifique se você atendeu aos seguintes requisitos:

Você possui o NODE instalado
Você possui o PGADMIN 4 instalado
Você tem o banco de dados configurado (vide instruções a seguir)

🚀 Instalando o projeto e primeira execução
Para instalar o WALLET - API, siga estas etapas:

utilizando o NPM, faça a instalação dos recursos necessários com o comando NPM INSTALL
No PGADMIN 4, crie o banco de dados com o nome wallet. Esse será utilizado para armazenamento das informações
para execução local, será necerrário que o BD tenha o nome wallet e o host seja localhost com a porta 5432 (configurações padrão do Postgres)


☕ Usando Wallet App
Para executar o projeto, após a instalação dos recursos do passo anterior, execute o comando NPM START. Recomenda-se a execução da API primeiro para que a utilização de portas seja feita corretamente. Na primeira execução, será feita a criação das tabelas.

