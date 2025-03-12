document.getElementById("cadastroForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Impede o envio do formulário para validação

    // Capturando os dados
    let nome = document.getElementById("nome").value;
    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;
    let confirmSenha = document.getElementById("confirmSenha").value;
    let telefone = document.getElementById("telefone").value;

    // Validação do email
    const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.(com|br|gov|org)$/;
    if (!email.match(emailRegex)) {
        alert("O e-mail deve ser em letras minúsculas, não pode ter caracteres especiais além de '@' e '.' e deve terminar com '.com', '.br', '.gov' ou '.org'.");
        return; // Interrompe o envio se o email for inválido
    }

    // Validação da senha e confirmação de senha
    if (senha !== confirmSenha) {
        alert("As senhas não coincidem!");
        return; // Interrompe o envio se as senhas não coincidirem
    }

    // Validação dos campos obrigatórios
    if (!nome || !telefone) {
        alert("Todos os campos obrigatórios devem ser preenchidos!");
        return; // Interrompe o envio se algum campo obrigatório estiver vazio
    }

    // Criando objeto para armazenar os dados do usuário
    let usuario = {
        nome: nome,
        email: email,
        senha: senha,
        telefone: telefone
    };

    // Salvando no localStorage
    localStorage.setItem("usuario", JSON.stringify(usuario));

    // Exibindo o alerta e redirecionando
    alert("Cadastro realizado com sucesso!");
    window.location.href = "login.html"; // Redireciona para a página de login
});

// Função para alternar a visibilidade da senha
function visibilidadeSenha() {
    const senha = document.getElementById("senha");
    const iconSenha = document.getElementById("iconSenha");

    var tipo = senha.type === "password" ? "text" : "password";
    senha.type = tipo;

    // Alterando o ícone
    iconSenha.textContent = senha.type === "password" ? "visibility" : "visibility_off";
}

// Função para alternar a visibilidade da senha confirmada
function visibilidadeSenhaConfirm() {
    const confirmSenha = document.getElementById("confirmSenha");
    const iconConfirmSenha = document.getElementById("iconConfirmSenha");

    var tipo = confirmSenha.type === "password" ? "text" : "password";
    confirmSenha.type = tipo;

    // Alterando o ícone
    iconConfirmSenha.textContent = confirmSenha.type === "password" ? "visibility" : "visibility_off";
}

// Função para o login
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let email = document.getElementById("loginEmail").value;
    let senha = document.getElementById("loginSenha").value;

    // Recuperando os dados do usuário
    let usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        alert("Nenhum usuário cadastrado!");
        return;
    }

    if (email === usuario.email && senha === usuario.senha) {
        alert("Login realizado com sucesso!");
        window.location.href = "index.html"; // Redireciona para a página inicial
    } else {
        alert("E-mail ou senha incorretos!");
    }
});