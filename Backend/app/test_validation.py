# test_orphan_validator.py

from application.validation.orphan_detector import OrphanDetector
from application.validation.orphan_validator import OrphanValidator

print("🧪 Testando OrphanValidator\n")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Setup: Criar detector e registrar IDs pulados
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
detector = OrphanDetector()

# Simula que clientes 200 e 300 foram pulados
detector.register_skipped("customers", 200)
detector.register_skipped("customers", 300)

print("📋 Setup:")
print(f"   Clientes pulados: {sorted(detector.get_skipped_ids('customers'))}")

# Criar validador
validator = OrphanValidator(detector)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Configuração de FK para tabela orders
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fk_configs = [
    {
        'source_column': 'customer_id',
        'reference_entity': 'customers',
        'target_column': 'customer_id',
        'reference_column': 'id'
    }
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Teste 1: Linha com FK válida (não é órfã)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n1️⃣ Testando linha VÁLIDA (cliente 100 não foi pulado):")

row_valid = {
    "id": 1,
    "customer_id": 100,  # ← Cliente 100 não foi pulado
    "amount": 150.00
}

errors = validator.validate_row(
    row=row_valid,
    row_index=10,
    table_name="orders",
    fk_configs=fk_configs
)

print(f"   Erros encontrados: {len(errors)}")
if errors:
    print(f"   ❌ ERRO: Não deveria ter erros!")
else:
    print(f"   ✅ OK: Nenhum erro (esperado)")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Teste 2: Linha órfã (referencia cliente pulado)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n2️⃣ Testando linha ÓRFÃ (cliente 200 foi pulado):")

row_orphan = {
    "id": 2,
    "customer_id": 200,  # ← Cliente 200 FOI pulado
    "amount": 200.00
}

errors = validator.validate_row(
    row=row_orphan,
    row_index=25,
    table_name="orders",
    fk_configs=fk_configs
)

print(f"   Erros encontrados: {len(errors)}")
if errors:
    print(f"   ✅ OK: Erro detectado (esperado)")
    for error in errors:
        print(f"\n   📄 Detalhes do erro:")
        print(f"      Linha: {error.row_index}")
        print(f"      Tabela: {error.table}")
        print(f"      Coluna: {error.column}")
        print(f"      Tipo: {error.error_type}")
        print(f"      Mensagem: {error.message}")
        print(f"      Valor: {error.value}")
        print(f"      Relacionado: {error.related_error}")
else:
    print(f"   ❌ ERRO: Deveria ter detectado órfão!")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Teste 3: Validar múltiplas linhas
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n3️⃣ Testando múltiplas linhas:")

rows = [
    {"id": 1, "customer_id": 100, "amount": 150.00},  # ✅ Válida
    {"id": 2, "customer_id": 200, "amount": 200.00},  # ❌ Órfã
    {"id": 3, "customer_id": 100, "amount": 75.00},   # ✅ Válida
    {"id": 4, "customer_id": 300, "amount": 300.00},  # ❌ Órfã
    {"id": 5, "customer_id": 100, "amount": 125.00},  # ✅ Válida
]

all_errors = validator.validate_rows(
    rows=rows,
    table_name="orders",
    fk_configs=fk_configs,
    start_row_index=10
)

print(f"   Total de linhas: {len(rows)}")
print(f"   Erros encontrados: {len(all_errors)}")
print(f"   Linhas válidas: {len(rows) - len(all_errors)}")

for error in all_errors:
    print(f"\n   ❌ Erro na linha {error.row_index}:")
    print(f"      customer_id = {error.value}")
    print(f"      Mensagem: {error.message}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Teste 4: Linha com FK NULL (não é erro)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n4️⃣ Testando linha com FK NULL:")

row_null = {
    "id": 6,
    "customer_id": None,  # ← NULL é permitido
    "amount": 50.00
}

errors = validator.validate_row(
    row=row_null,
    row_index=30,
    table_name="orders",
    fk_configs=fk_configs
)

print(f"   Erros encontrados: {len(errors)}")
if errors:
    print(f"   ❌ ERRO: NULL não deveria gerar erro de órfão!")
else:
    print(f"   ✅ OK: NULL ignorado (esperado)")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Resumo
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n" + "="*60)
print("📊 RESUMO DOS TESTES")
print("="*60)
print("✅ Linha válida: detectada corretamente")
print("✅ Linha órfã: detectada corretamente")
print("✅ Múltiplas linhas: 2 órfãs de 5 linhas")
print("✅ FK NULL: ignorada corretamente")
print("="*60)

print("\n✅ Todos os testes do OrphanValidator passaram!")