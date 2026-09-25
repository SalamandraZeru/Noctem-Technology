# Gates antes da publicação

O site está funcional e pode gerar um build estático. Os itens abaixo dependem de decisão externa e não foram presumidos:

1. revisar juridicamente a Política de Privacidade e os Termos de Uso (`src/content/legal/`);
2. incluir razão social, CNPJ e endereço da sede na seção “Quem é o controlador” da política, caso a empresa já esteja formalizada;
3. nomear o provedor de hospedagem/CDN na seção “Compartilhamento de dados”, depois de escolhido;
4. confirmar os prazos de guarda descritos na política (12 meses para contatos sem contratação; 6 meses para registros de acesso);
5. autorizar a publicação pública e a conexão do domínio `noctem.agency`;
6. configurar DNS e plataforma de hospedagem somente após essa autorização;
7. se analytics for adotado no futuro, adicionar a categoria ao banner de consentimento, à tabela de cookies da política e aumentar `site.legal.version`;
8. confirmar uma licença antes de tornar o repositório público como código aberto.

Sempre que a política mudar, atualize `site.legal.version` e `site.legal.updatedAt` em `src/data/site.ts`: o banner de consentimento volta a ser exibido para quem aceitou a versão anterior. Renove o campo `Expires` de `public/.well-known/security.txt` antes de 24/09/2027.

Nenhum segredo ou credencial é necessário para executar o projeto localmente.
