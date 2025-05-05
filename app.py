from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import psycopg2
from urllib.parse import urlparse

# Configuração do Flask
app = Flask(__name__)

# Configuração automática para Heroku/Railway
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # Configuração para PostgreSQL (Heroku/Railway)
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # Fallback para SQLite local
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reservas.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'sua_chave_secreta_local') 

db = SQLAlchemy(app)

# Modelo de dados para reservas
class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_cliente = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    data_reserva = db.Column(db.String(10), nullable=False)  # Formato YYYY-MM-DD
    quantidade_pessoas = db.Column(db.Integer, nullable=False)
    tipo_evento = db.Column(db.String(100), nullable=False)
    observacoes = db.Column(db.String(255))
    metodo_pagamento = db.Column(db.String(50))
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='confirmada')

# Rota principal - serve o template HTML
@app.route('/')
def home():
    return render_template('home.html')

# Rota para salvar as reservas
@app.route('/api/reservas', methods=['POST'])
def criar_reserva():
    try:
        data = request.get_json()
        
        # Verifica se a data já está reservada
        reserva_existente = Reserva.query.filter_by(data_reserva=data['data_reserva']).first()
        if reserva_existente:
            return jsonify({
                'success': False,
                'error': 'Esta data já está reservada!'
            }), 400
        
        nova_reserva = Reserva(
            nome_cliente=data['nome_cliente'],
            telefone=data['telefone'],
            data_reserva=data['data_reserva'],
            quantidade_pessoas=data['quantidade_pessoas'],
            tipo_evento=data['tipo_evento'],
            observacoes=data.get('observacoes', ''),
            metodo_pagamento='pendente'
        )
        
        db.session.add(nova_reserva)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reserva criada com sucesso!',
            'reserva_id': nova_reserva.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Rota para listar reservas
@app.route('/api/reservas', methods=['GET'])
def listar_reservas():
    try:
        reservas = Reserva.query.order_by(Reserva.data_reserva).all()
        reservas_json = [{
            'id': r.id,
            'nome_cliente': r.nome_cliente,
            'telefone': r.telefone,
            'data_reserva': r.data_reserva,
            'quantidade_pessoas': r.quantidade_pessoas,
            'tipo_evento': r.tipo_evento,
            'observacoes': r.observacoes,
            'metodo_pagamento': r.metodo_pagamento,
            'status': r.status,
            'data_criacao': r.data_criacao.strftime('%d/%m/%Y %H:%M')
        } for r in reservas]
        
        return jsonify({
            'success': True,
            'reservas': reservas_json
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Rota para atualizar pagamento
@app.route('/api/reservas/<int:id>/pagamento', methods=['PUT'])
def atualizar_pagamento(id):
    try:
        reserva = Reserva.query.get_or_404(id)
        data = request.get_json()
        
        reserva.metodo_pagamento = data['metodo_pagamento']
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pagamento atualizado com sucesso!'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Rota para deletar reserva
@app.route('/api/reservas/<int:id>', methods=['DELETE'])
def deletar_reserva(id):
    try:
        data = request.get_json()
        if data.get('senha') != '147952':  # Sua senha de admin
            return jsonify({
                'success': False,
                'error': 'Senha incorreta!'
            }), 403
            
        reserva = Reserva.query.get_or_404(id)
        db.session.delete(reserva)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reserva deletada com sucesso!'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def init_db():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    init_db()
    app.run(host="0.0.0.0", port=5000)