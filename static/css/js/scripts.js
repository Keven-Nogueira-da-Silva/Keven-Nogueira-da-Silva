tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          success: '#28a745',
          danger: '#dc3545',
          warning: '#ffc107',
          pix: '#32BBAD',
          cartao: '#1A4F8B'
        }
      }
    }
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const formReserva = document.getElementById('formReserva');
    const mensagemDiv = document.getElementById('mensagem');
    const listaReservas = document.getElementById('listaReservas');
    const areaPagamento = document.getElementById('areaPagamento');
    
    // Configurações iniciais
    document.getElementById('data').min = new Date().toISOString().split('T')[0];
    configurarMascaraTelefone();
    carregarReservas();
    
    // Formulário de reserva
    formReserva.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const reservaData = {
        nome_cliente: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        data_reserva: document.getElementById('data').value,
        quantidade_pessoas: document.getElementById('pessoas').value,
        tipo_evento: document.getElementById('evento').value,
        observacoes: document.getElementById('obs').value
      };
      
      fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservaData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          mostrarMensagem('Reserva realizada com sucesso!', 'success');
          formReserva.reset();
          carregarReservas();
          
          // Mostrar área de pagamento com o ID da reserva
          areaPagamento.classList.remove('hidden');
          areaPagamento.dataset.reservaId = data.reserva_id;
        } else {
          mostrarMensagem(`Erro: ${data.error}`, 'error');
        }
      })
      .catch(error => {
        mostrarMensagem('Erro ao conectar com o servidor', 'error');
        console.error('Error:', error);
      });
    });
    
    // Função para carregar reservas
    function carregarReservas() {
      fetch('/api/reservas')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            renderizarReservas(data.reservas);
          } else {
            console.error('Erro ao carregar reservas:', data.error);
          }
        })
        .catch(error => console.error('Error:', error));
    }
    
    // Função para renderizar reservas
    function renderizarReservas(reservas) {
      listaReservas.innerHTML = '';
      
      if (reservas.length === 0) {
        listaReservas.innerHTML = `
          <div class="text-center py-8">
            <i class="fas fa-calendar-xmark text-4xl text-primary-300 mb-4"></i>
            <p class="text-primary-500">Nenhuma reserva cadastrada ainda</p>
          </div>
        `;
        return;
      }
      
      reservas.forEach((r, i) => {
        const div = document.createElement("div");
        div.className = "bg-white rounded-lg shadow-md p-5 relative border-l-4 border-primary-500";
        
        const statusClass = r.status === 'confirmada' ? 
          'bg-green-500 text-white' : 'bg-yellow-500 text-white';
        
        div.innerHTML = `
          <div class="absolute top-3 right-3 ${statusClass} text-xs font-bold px-2 py-1 rounded-full">
            <i class="fas fa-${r.status === 'confirmada' ? 'check' : 'clock'} mr-1"></i> 
            ${r.status === 'confirmada' ? 'Confirmada' : 'Pendente'}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 class="font-bold text-primary-700 mb-1 flex items-center">
                <i class="fas fa-user mr-2 text-sm"></i> Nome
              </h3>
              <p class="text-gray-700">${r.nome_cliente}</p>
            </div>
            
            <div>
              <h3 class="font-bold text-primary-700 mb-1 flex items-center">
                <i class="fas fa-phone mr-2 text-sm"></i> Telefone
              </h3>
              <p class="text-gray-700">${r.telefone}</p>
            </div>
            
            <div>
              <h3 class="font-bold text-primary-700 mb-1 flex items-center">
                <i class="fas fa-calendar-day mr-2 text-sm"></i> Data
              </h3>
              <p class="text-gray-700">${formatarData(r.data_reserva)}</p>
            </div>
            
            <div>
              <h3 class="font-bold text-primary-700 mb-1 flex items-center">
                <i class="fas fa-users mr-2 text-sm"></i> Pessoas
              </h3>
              <p class="text-gray-700">${r.quantidade_pessoas}</p>
            </div>
          </div>
          
          <div class="mb-4">
            <h3 class="font-bold text-primary-700 mb-1 flex items-center">
              <i class="fas fa-gift mr-2 text-sm"></i> Tipo de Evento
            </h3>
            <p class="text-gray-700">${r.tipo_evento}</p>
          </div>
          
          ${r.observacoes ? `
            <div class="mb-4">
              <h3 class="font-bold text-primary-700 mb-1 flex items-center">
                <i class="fas fa-comment-dots mr-2 text-sm"></i> Observações
              </h3>
              <p class="text-gray-700">${r.observacoes}</p>
            </div>
          ` : ''}
          
          <div class="mb-4">
            <h3 class="font-bold text-primary-700 mb-1 flex items-center">
              <i class="fas fa-money-bill-wave mr-2 text-sm"></i> Método de Pagamento
            </h3>
            <p class="text-gray-700">${r.metodo_pagamento}</p>
          </div>
          
          <div class="pt-4 border-t border-gray-200">
            <label class="block text-sm font-medium text-primary-700 mb-1">Senha para deletar: “Em caso de cancelamento, entre em contato conosco.”</label>
            <div class="flex space-x-2">
              <input type="password" id="senha-${r.id}" placeholder="Digite a senha" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              <button onclick="deletarReserva(${r.id})" 
                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200">
                <i class="fas fa-trash mr-1"></i> Deletar
              </button>
            </div>
          </div>
        `;
        listaReservas.appendChild(div);
      });
    }
    
    // Função para formatar data
    function formatarData(dataString) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dataString).toLocaleDateString('pt-BR', options);
    }
    
    // Função para mostrar mensagens
    function mostrarMensagem(texto, tipo) {
      const alertClasses = {
        success: "bg-green-100 border border-green-400 text-green-700",
        error: "bg-red-100 border border-red-400 text-red-700"
      };
      
      mensagemDiv.innerHTML = `
        <div class="px-4 py-3 rounded relative ${alertClasses[tipo]}" role="alert">
          <span class="block sm:inline">${texto}</span>
        </div>
      `;
      setTimeout(() => mensagemDiv.innerHTML = '', 3000);
    }
    
    // Configurar máscara de telefone
    function configurarMascaraTelefone() {
      const telefoneInput = document.getElementById('telefone');
      telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        if (value.length > 0) {
          value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
          if (value.length > 10) {
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
          }
        }
        
        e.target.value = value;
      });
    }
  });
  
  // Funções globais para pagamento
  function mostrarPix() {
    document.getElementById('pixArea').classList.remove('hidden');
    document.getElementById('cartaoArea').classList.add('hidden');
  }
  
  function mostrarCartao() {
    document.getElementById('cartaoArea').classList.remove('hidden');
    document.getElementById('pixArea').classList.add('hidden');
  }
  
  function finalizarPagamento(metodo) {
    const reservaId = document.getElementById('areaPagamento').dataset.reservaId;
    const metodoPagamento = metodo === 'pix' ? 'PIX (50% adiantado)' : 
                          metodo === 'cartao' ? 'Cartão (50% adiantado)' : 
                          'Dinheiro (combinar pagamento)';
    
    fetch(`/api/reservas/${reservaId}/pagamento`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metodo_pagamento: metodoPagamento })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Pagamento registrado com sucesso! Obrigado pela sua reserva.');
        document.getElementById('areaPagamento').classList.add('hidden');
        location.reload();
      } else {
        alert(`Erro: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Erro ao conectar com o servidor');
    });
  }
  
  function deletarReserva(id) {
    const senha = document.getElementById(`senha-${id}`).value;
    
    fetch(`/api/reservas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senha: senha })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Reserva deletada com sucesso!');
        location.reload();
      } else {
        alert(`Erro: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Erro ao conectar com o servidor');
    });
  }