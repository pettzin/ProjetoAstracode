document.addEventListener("DOMContentLoaded", function () {
    // Captura o campo de telefone
    const telefoneInput = document.getElementById("cadastroTelefone");

    telefoneInput.addEventListener("input", function (e) {
        let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

        if (valor.length > 11) {
            valor = valor.substring(0, 11); // Limita a 11 dígitos
        }

        let formatado = "";

        if (valor.length > 0) formatado += "(";
        if (valor.length >= 2) formatado += valor.substring(0, 2) + ") ";
        else formatado += valor;
        if (valor.length > 2 && valor.length <= 6) formatado += valor.substring(2);
        if (valor.length > 6) formatado += valor.substring(2, 7) + "-";
        if (valor.length > 7) formatado += valor.substring(7, 11);

        // Evita que () e - fiquem travando na exclusão
        if (e.inputType === "deleteContentBackward") {
            if (e.target.selectionStart === 10) formatado = formatado.slice(0, -1); // Remove '-' ao apagar
            if (e.target.selectionStart === 4) formatado = formatado.slice(0, -1); // Remove ')' ao apagar
            if (e.target.selectionStart === 1) formatado = ""; // Remove '(' ao apagar tudo
        }
        e.target.value = formatado;
    });

    document.getElementById("cadastroForm").addEventListener("submit", function (e) {
        e.preventDefault(); // Impede o envio do formulário para validação

        // Capturando os dados
        let nome = document.getElementById("cadastroNome").value;
        let email = document.getElementById("cadastroEmail").value;
        let telefone = document.getElementById("cadastroTelefone").value;
        let senha = document.getElementById("cadastroSenha").value;
        let confirmSenha = document.getElementById("confirmarSenha").value;

        // Validação do nome
        const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
        if (!nome.match(nomeRegex)) {
            alert("O nome deve conter apenas letras e espaços.");
            return; // Interrompe o envio se o nome for inválido
        }

        // Validação do email
        const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.(com|br|gov|edu|org)$/;
        if (!email.match(emailRegex)) {
            alert("O e-mail deve ser em letras minúsculas, não pode ter caracteres especiais além de '@' e '.' e deve terminar com '.com', '.br', '.gov', '.edu' ou '.org'.");
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
            telefone: telefone,
            senha: senha
        };

        // Salvando no localStorage
        localStorage.setItem("usuario", JSON.stringify(usuario));

        // Exibindo o alerta e redirecionando
        alert("Cadastro realizado com sucesso!");
        window.location.href = "index.html"; // Redireciona para a página de login
    });
});

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
        window.location.href = "home.html"; // Redireciona para a página inicial
    } else {
        alert("E-mail ou senha incorretos!");
    }
});

// Função para alternar a visibilidade da senha
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility_off";
    } else {
        input.type = "password";
        icon.textContent = "visibility";
    }
}