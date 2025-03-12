// Validação personalizada de email
document.getElementById("cadastroForm").addEventListener("submit", function(e) {
    e.preventDefault(); // Impede o envio do formulário para validação

    let email = document.getElementById("email").value;
    const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.(com|br|gov|org)$/; // Permitido apenas letras minúsculas, números e um ponto antes do @, e terminação .com ou .br
    
    // Verificando se o email é válido
    if (!email.match(emailRegex)) {
        alert("O e-mail deve ser em letras minúsculas, não pode ter caracteres especiais além de '@' e '.' e deve terminar com '.com', '.br', '.gov' ou '.org'.");
        return false; // Bloqueia o envio do formulário se o e-mail não for válido
    } 

    // Validando a senha e a confirmação de senha
    let senha = document.getElementById("senha").value;
    let confirmSenha = document.getElementById("confirmSenha").value;
    if (senha !== confirmSenha) {
        alert("As senhas não coincidem!");
        return false;
    }

    // Se o email e as senhas forem válidos, submete o formulário
    alert("Cadastro realizado com sucesso!");
    this.submit(); // Envia o formulário
});

// Função para alternar a visibilidade da senha
function visibilidadeSenha() {
    const senha = document.getElementById("senha");
    const iconSenha = document.getElementById("iconSenha");

    var tipo = senha.type === "password" ? "text" : "password";
    senha.type = tipo;

    // Alterando o ícone
    if (senha.type === "password") {
        iconSenha.textContent = "visibility"; // Exibe o ícone 'visibility'
    } else {
        iconSenha.textContent = "visibility_off"; // Exibe o ícone 'visibility_off'
    }
}

// Função para alternar a visibilidade da senha confirmada
function visibilidadeSenhaConfirm() {
        const confirmSenha = document.getElementById("confirmSenha");
        const iconConfirmSenha = document.getElementById("iconConfirmSenha");
    
        var tipo = confirmSenha.type === "password" ? "text" : "password";
        confirmSenha.type = tipo;
    
        // Alterando o ícone
        if (confirmSenha.type === "password") {
            iconConfirmSenha.textContent = "visibility"; // Exibe o ícone 'visibility'
        } else {
            iconConfirmSenha.textContent = "visibility_off"; // Exibe o ícone 'visibility_off'
        }
    }
    
    function fakeBD() {
        var senha = document.getElementById("senha").value;
        var email = document.getElementById("email").value;
    
        window.alert(email + " " + senha).value
    }