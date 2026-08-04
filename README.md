GESTNET (Ana Vitória Basniak, Luana Gabrielly Pszymus, Rafael Roiek Corrêa)

1- Introdução: O sistema a ser desenvolvido é um gerenciador com finalidade de auxiliar no controle de locações de kitnets. O sistema vai permitir cadastro de inquilino, contratos e registrar mensalmente o consumo de energia elétrica, realizando automáticamente o cálculo para gerar o valor que cada inquilino vai pagar.

2- Problema Identificado: O cálculo de energia e controle de aluguel são feitos de forma manual, e o dono registra no papel as leituras do medidor de energia e soma o valor da energia com o aluguel;

3- Justificativa: Otimização de tempo, menos risco de falha humana, organizar as informações em um banco de dados, maior facilidade para fazer as consultas, envio rápido das cobranças;

4- Objetivo Geral: Desenvolver um sistema para o gerenciamento de locações de kitnets, realizando o cálculo do consumo de energia elétrica resultando no valor total do aluguel;

5- Objetivos Específicos: Cadastrar kitnets; Cadastrar inquilinos; Cadastrar contratos; Registro de consumo de energia; Cálculo de consumo de energia; Calcular o valor do aluguel;

6- Descrição do Processo Atual: Atualmente, o proprietário realiza todas as atividades manualmente, ocorrendo da seguinte forma: Verifica a leitura do medidor de energia de cada kitnet. Anota os valores em papel. Calcula o consumo subtraindo a leitura anterior da leitura atual. Multiplica o consumo pelo valor do kWh. Soma o valor da energia ao aluguel. Informa ao inquilino o valor que deverá ser pago;

7- Como Funcionará a Automação: O sistema irá: Conectar ao banco PostgreSQL. Buscar os dados dos contratos ativos. Registrar a leitura atual do medidor de energia; Recuperar automaticamente a leitura anterior; Calcular o consumo de energia (kWh); Calcular o valor da energia com base no preço do kWh; Somar automaticamente o valor da energia ao aluguel; Armazenar os resultados no banco de dados; 

8- Tecnologias Utilizadas: JavaScript, Node.js, PostgreSQL, Requests, React Vite, Css, Sequelize, Axios;

9- Funcionalidades Previstas: Registro do consumo mensal de energia, Cadastro de inquilinos, Cadastro de Kitnet, Cálculo do consumo de energia + aluguel Gerar código de pagamento.
