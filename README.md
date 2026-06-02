# Converter XML — Moodle Quiz Generator

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Styled--Components-6.x-DB7093?style=for-the-badge&logo=styled-components&logoColor=white" />
</p>

<p align="center">
  <a href="https://dholand4.github.io/converter_xml/" target="_blank">
    <img src="https://img.shields.io/badge/Demo%20ao%20vivo-GitHub%20Pages-222222?style=for-the-badge&logo=github&logoColor=white" />
  </a>
</p>

> Ferramenta web para geração de arquivos XML compatíveis com o formato de importação de questionários do **Moodle**, eliminando a necessidade de criar os arquivos manualmente.

---

## Índice

- [Sobre](#-sobre)
- [Preview](#-preview)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Como rodar](#-como-rodar)

---

## Sobre

Cadastrar questionários diretamente no Moodle é um processo lento e repetitivo. O **Converter XML** permite montar as questões em uma interface simples e exportar um arquivo `.xml` pronto para importação na plataforma — economizando tempo e evitando erros manuais.

---

## Preview

<div align="center">
  <img src="https://i.imgur.com/CDWHaTy.png" alt="Preview do Converter XML" width="1122" />
</div>

---

## Funcionalidades

- 📝 Montagem de questionários diretamente na interface
- ⚙️ Geração de arquivo XML no formato aceito pelo Moodle
- 📥 Download do arquivo gerado com um clique
- 🌐 Roda inteiramente no navegador, sem necessidade de backend

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18 | Interface |
| TypeScript | Tipagem estática |
| Vite | Bundler e dev server |
| Styled-Components | Estilização |

---

## Como rodar

```bash
# Clonar o repositório
git clone https://github.com/dholand4/converter_xml.git

# Entrar na pasta do projeto
cd converter_xml

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
