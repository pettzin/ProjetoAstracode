// Função para alternar entre as abas
function mudarTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    document.getElementById(tabId + '-tab').classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Função para mostrar/ocultar senha
function visibilidadeSenha(inputId) {
    const passwordInput = document.getElementById(inputId);
    const icon = document.getElementById(inputId + 'Icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Função para formatar o telefone
function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, ''); 
    let resultado = '';
    
    if (valor.length > 0) {
        resultado = '(' + valor.substring(0, Math.min(2, valor.length));
    }
    
    if (valor.length > 2) {
        resultado += ') ' + valor.substring(2, Math.min(7, valor.length));
    }
    
    if (valor.length > 7) {
        resultado += '-' + valor.substring(7, Math.min(11, valor.length));
    }
    
    input.value = resultado;
}

// Função para salvar usuário
function salvarUsuario(nome, email, telefone, senha) {
    // Verificar se já existe um array de usuários
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Verificar se o email já está cadastrado
    const emailExistente = usuarios.some(usuario => usuario.email === email);
    if (emailExistente) {
        alert('Este email já está cadastrado!');
        return false;
    }
    
    // Adicionar novo usuário
    const novoUsuario = {
        nome: nome,
        email: email,
        telefone: telefone,
        senha: senha
    };
    
    usuarios.push(novoUsuario);
    
    // Salvar array atualizado 
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return true;
}


function verificarLogin(email, senha) {
    // Obter array de usuários do localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Verificar se existe um usuário com o email e senha fornecidos
    const usuarioEncontrado = usuarios.find(usuario => 
        usuario.email === email && usuario.senha === senha
    );
    
    return usuarioEncontrado;
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    
    const telefoneInput = document.querySelector('input[type="tel"]');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            formatarTelefone(this);
        });
    }
    
    // Formulário de cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        const nomeInput = cadastroForm.querySelector('input[placeholder="Nome completo"]');
        const emailInput = cadastroForm.querySelector('input[type="email"]');
        const senhaInput = document.getElementById('cadastroSenha');
        
        cadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter valores dos campos
            const nome = nomeInput.value;
            const email = emailInput.value;
            const telefone = telefoneInput.value;
            const senha = senhaInput.value;
            const confirmarSenha = document.getElementById('confirmarSenha').value;
            
            // Validar nome 
            const regexNome = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/;
            if (!regexNome.test(nome)) {
                alert('Nome inválido. Use apenas letras.');
                return;
            }
            
            // Validar email 
            const regexEmail = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            if (!regexEmail.test(email)) {
                alert('Email inválido. Use apenas letras, números, _ e . antes do @');
                return;
            }
            
             // Validar telefone
            if (telefone.length < 14) {
                alert('Telefone inválido. Formato esperado: (XX) XXXXX-XXXX');
                return;
            }
            
            const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!regexSenha.test(senha)) {
                alert('A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um caractere especial.');
                return;
            }
            
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            
            if (salvarUsuario(nome, email, telefone, senha)) {
                alert('Cadastro realizado com sucesso!');
                
                this.reset();
                
                mudarTab('login');
            }
        });
    }
    
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[placeholder="Email"]').value;
            const senha = document.getElementById('loginSenha').value;
            
            const usuario = verificarLogin(email, senha);
            
            if (usuario) {
                localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                
                // Redirecionar para a página home
                window.location.href = 'home.html';
            } else {
                alert('Email ou senha incorretos!');
            }
        });
    }
    
});