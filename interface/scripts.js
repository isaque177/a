// Configurações da API
const API_BASE_URL = 'http://localhost:8080/api/imagens';

// Elementos DOM
const form = document.getElementById('imagemForm');
const nomeInput = document.getElementById('nome');
const urlInput = document.getElementById('url');
const galeria = document.getElementById('galeria');
const loading = document.getElementById('loading');
const emptyMessage = document.getElementById('emptyMessage');
const totalImagens = document.getElementById('totalImagens');
const buscarInput = document.getElementById('busca');
const btnBuscar = document.getElementById('btnBuscar');
const btnLimparBusca = document.getElementById('btnLimparBusca');
const cancelarEdicao = document.getElementById('cancelarEdicao');

// Modal elements
const modalConfirmacao = document.getElementById('modalConfirmacao');
const modalVisualizacao = document.getElementById('modalVisualizacao');
const confirmarExclusao = document.getElementById('confirmarExclusao');
const cancelarExclusao = document.getElementById('cancelarExclusao');
const modalClose = document.querySelector('.modal-close');
const imagemModal = document.getElementById('imagemModal');
const nomeModal = document.getElementById('nomeModal');

// Variáveis de controle
let imagemParaExcluir = null;
let imagemParaEditar = null;
let todasImagens = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Banco de Imagens carregado!');
    carregarImagens();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Busca
    btnBuscar.addEventListener('click', buscarImagens);
    btnLimparBusca.addEventListener('click', limparBusca);
    buscarInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarImagens();
        }
    });
    
    // Cancelar edição
    cancelarEdicao.addEventListener('click', cancelarEdicaoImagem);
    
    // Modal confirmação
    confirmarExclusao.addEventListener('click', confirmarRemocaoImagem);
    cancelarExclusao.addEventListener('click', fecharModalConfirmacao);
    
    // Modal visualização
    modalClose.addEventListener('click', fecharModalVisualizacao);
    
    // Fechar modais clicando fora
    window.addEventListener('click', function(e) {
        if (e.target === modalConfirmacao) {
            fecharModalConfirmacao();
        }
        if (e.target === modalVisualizacao) {
            fecharModalVisualizacao();
        }
    });
}

// Carregar todas as imagens
async function carregarImagens() {
    try {
        mostrarLoading(true);
        
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const imagens = await response.json();
        todasImagens = imagens;
        
        exibirImagens(imagens);
        atualizarContadorImagens(imagens.length);
        
        console.log(`✅ ${imagens.length} imagens carregadas com sucesso!`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar imagens:', error);
        mostrarMensagemErro('Erro ao carregar as imagens. Verifique se o servidor está rodando.');
    } finally {
        mostrarLoading(false);
    }
}

// Exibir imagens na galeria
function exibirImagens(imagens) {
    galeria.innerHTML = '';
    
    if (imagens.length === 0) {
        emptyMessage.style.display = 'block';
        galeria.style.display = 'none';
        return;
    }
    
    emptyMessage.style.display = 'none';
    galeria.style.display = 'grid';
    
    imagens.forEach((imagem, index) => {
        const imagemCard = criarCardImagem(imagem, index);
        galeria.appendChild(imagemCard);
    });
}

// Criar card de imagem
function criarCardImagem(imagem, index) {
    const card = document.createElement('div');
    card.className = 'imagem-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="imagem-container" onclick="visualizarImagem(${imagem.id})">
            <img src="${imagem.url}" alt="${imagem.nome}" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Não+Encontrada'">
            <div class="imagem-overlay">
                <div class="overlay-text">
                    <i class="fas fa-eye"></i><br>
                    Clique para ampliar
                </div>
            </div>
        </div>
        <div class="imagem-info">
            <div class="imagem-nome">
                <i class="fas fa-user"></i>
                ${imagem.nome}
            </div>
            <div class="imagem-actions">
                <button onclick="editarImagem(${imagem.id})" class="btn btn-secondary btn-small">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="confirmarExclusaoImagem(${imagem.id})" class="btn btn-danger btn-small">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const nome = nomeInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!nome || !url) {
        mostrarMensagemErro('Por favor, preencha todos os campos.');
        return;
    }
    
    if (!isValidUrl(url)) {
        mostrarMensagemErro('Por favor, insira uma URL válida.');
        return;
    }
    
    const imagemData = { nome, url };
    
    try {
        let response;
        
        if (imagemParaEditar) {
            // Editando imagem existente
            response = await fetch(`${API_BASE_URL}/${imagemParaEditar}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(imagemData)
            });
            
            if (response.ok) {
                mostrarMensagemSucesso('Imagem atualizada com sucesso!');
                cancelarEdicaoImagem();
            }
        } else {
            // Adicionando nova imagem
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(imagemData)
            });
            
            if (response.ok) {
                mostrarMensagemSucesso('Imagem adicionada com sucesso!');
                form.reset();
            }
        }
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        await carregarImagens();
        
    } catch (error) {
        console.error('❌ Erro ao salvar imagem:', error);
        mostrarMensagemErro('Erro ao salvar a imagem. Tente novamente.');
    }
}

// Buscar imagens por nome
async function buscarImagens() {
    const termoBusca = buscarInput.value.trim();
    
    if (!termoBusca) {
        carregarImagens();
        return;
    }
    
    try {
        mostrarLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/buscar?nome=${encodeURIComponent(termoBusca)}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const imagens = await response.json();
        exibirImagens(imagens);
        atualizarContadorImagens(imagens.length, `Encontradas: ${imagens.length}`);
        
        console.log(`🔍 Busca por "${termoBusca}": ${imagens.length} resultados`);
        
    } catch (error) {
        console.error('❌ Erro ao buscar imagens:', error);
        mostrarMensagemErro('Erro ao buscar imagens.');
    } finally {
        mostrarLoading(false);
    }
}

// Limpar busca e mostrar todas as imagens
function limparBusca() {
    buscarInput.value = '';
    carregarImagens();
}

// Editar imagem
function editarImagem(id) {
    const imagem = todasImagens.find(img => img.id === id);
    
    if (imagem) {
        imagemParaEditar = id;
        nomeInput.value = imagem.nome;
        urlInput.value = imagem.url;
        
        // Alterar texto do botão e mostrar cancelar
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Imagem';
        submitBtn.className = 'btn btn-search';
        
        cancelarEdicao.style.display = 'inline-flex';
        
        // Scroll para o formulário
        document.querySelector('.form-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
        mostrarMensagemSucesso(`Editando: ${imagem.nome}`);
    }
}

// Cancelar edição
function cancelarEdicaoImagem() {
    imagemParaEditar = null;
    form.reset();
    
    // Restaurar botão original
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Imagem';
    submitBtn.className = 'btn btn-primary';
    
    cancelarEdicao.style.display = 'none';
}

// Confirmar exclusão (mostrar modal)
function confirmarExclusaoImagem(id) {
    imagemParaExcluir = id;
    modalConfirmacao.style.display = 'block';
}

// Confirmar remoção
async function confirmarRemocaoImagem() {
    if (!imagemParaExcluir) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${imagemParaExcluir}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        mostrarMensagemSucesso('Imagem removida com sucesso!');
        await carregarImagens();
        
        console.log(`🗑️ Imagem ${imagemParaExcluir} removida com sucesso!`);
        
    } catch (error) {
        console.error('❌ Erro ao remover imagem:', error);
        mostrarMensagemErro('Erro ao remover a imagem.');
    } finally {
        fecharModalConfirmacao();
    }
}

// Fechar modal de confirmação
function fecharModalConfirmacao() {
    modalConfirmacao.style.display = 'none';
    imagemParaExcluir = null;
}

// Visualizar imagem (modal)
function visualizarImagem(id) {
    const imagem = todasImagens.find(img => img.id === id);
    
    if (imagem) {
        imagemModal.src = imagem.url;
        imagemModal.alt = imagem.nome;
        nomeModal.textContent = imagem.nome;
        modalVisualizacao.style.display = 'block';
    }
}

// Fechar modal de visualização
function fecharModalVisualizacao() {
    modalVisualizacao.style.display = 'none';
}

// Mostrar/ocultar loading
function mostrarLoading(mostrar) {
    loading.style.display = mostrar ? 'block' : 'none';
}

// Atualizar contador de imagens
function atualizarContadorImagens(total, texto = null) {
    totalImagens.textContent = texto || `${total} ${total === 1 ? 'imagem' : 'imagens'}`;
}

// Validar URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Mostrar mensagem de erro
function mostrarMensagemErro(mensagem) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${mensagem}`;
    
    // Inserir após o formulário
    const formSection = document.querySelector('.form-section');
    formSection.appendChild(errorDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
    
    // Scroll para a mensagem
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Mostrar mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    
    // Inserir após o formulário
    const formSection = document.querySelector('.form-section');
    formSection.appendChild(successDiv);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Função para testar a conectividade com a API
async function testarConexaoAPI() {
    try {
        const response = await fetch(API_BASE_URL);
        if (response.ok) {
            console.log('✅ Conexão com a API estabelecida com sucesso!');
            return true;
        } else {
            console.warn('⚠️ API respondeu, mas com status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro de conexão com a API:', error);
        mostrarMensagemErro('Não foi possível conectar com o servidor. Verifique se o Spring Boot está rodando na porta 8080.');
        return false;
    }
}

// Testar conexão na inicialização
testarConexaoAPI();