# 📊 Regras de Recomendações - Tela Inicial

## Visão Geral

A tela inicial (`HomeScreen`) exibe recomendações personalizadas baseadas no histórico e preferências do usuário, calculadas pelo `MatchingService`.

## Endpoint Utilizado

- **GET** `/api/matching/recommendations`
- Limite padrão: **20 itens**

## Critérios de Seleção

### 1. **Filtros Básicos**
- ✅ Peças **disponíveis** (`is_available = true` e `in_use = false`)
- ✅ Peças de **outros usuários** (não mostra próprias peças)
- ✅ Peças com **avaliação ≥ 4.0** ou **sem avaliação ainda**

### 2. **Priorização por Categorias**

O sistema identifica as categorias de interesse do usuário através de:

#### a) **Favoritos**
- Busca todas as peças que o usuário favoritou
- Extrai os `clothing_category_id` dessas peças

#### b) **Histórico de Aluguéis**
- Busca todos os aluguéis do usuário como locatário
- Extrai os `clothing_category_id` das peças alugadas

#### c) **Categorias Preferidas**
- Combina categorias de favoritos + aluguéis
- Remove duplicatas
- **Prioriza peças dessas categorias**

### 3. **Sistema de Pontuação (Match Score)**

Cada peça recebe uma pontuação de 0-100+ baseada em:

#### a) **Compatibilidade de Medidas (60% do peso)**
- Compara medidas do usuário com medidas da peça
- Usa o método `compatibilityWith()` do modelo `UserMeasurement`
- Score: 0-100 pontos

#### b) **Proximidade Geográfica (até 40 pontos)**
- Calcula distância entre usuário e proprietário da peça
- **≤ 5 km**: +40 pontos
- **≤ 10 km**: +30 pontos
- **≤ 20 km**: +20 pontos
- **≤ 50 km**: +10 pontos
- **> 50 km**: 0 pontos

#### c) **Avaliação da Peça (até 10 pontos)**
- `(rating / 5) * 10`
- Exemplo: rating 4.5 = 9 pontos

#### d) **Popularidade (até 5 pontos)**
- Baseado em `rentals_count`
- Máximo: 5 pontos (mesmo que tenha 100+ aluguéis)

### 4. **Ordenação Final**

1. Ordena por **match_score** (maior para menor)
2. Retorna os **top 20** itens

## Fallbacks

### Se não houver itens nas categorias preferidas:
- Busca **todas as peças disponíveis** (sem filtro de categoria)
- Ordena por **data de criação** (mais recentes primeiro)
- Limita a 20 itens

### Se o usuário não tiver medidas cadastradas:
- Usa apenas **proximidade geográfica** para ranquear
- Se não tiver localização: ordena por **data de criação**

### Se o endpoint falhar (erro 500):
- Frontend usa fallback: busca `/clothing-items?per_page=20`
- Mostra itens disponíveis sem personalização

## Exemplo de Cálculo de Score

```
Usuário tem medidas cadastradas:
- Compatibilidade: 85% → 85 * 0.6 = 51 pontos
- Distância: 8 km → +30 pontos
- Rating: 4.5 → (4.5/5) * 10 = 9 pontos
- Popularidade: 3 aluguéis → +3 pontos
----------------------------------------
TOTAL: 93 pontos
```

## Requisitos para Melhor Personalização

1. ✅ **Cadastrar medidas** (`/user/measurements`)
2. ✅ **Favoritar peças** de interesse
3. ✅ **Alugar peças** para criar histórico
4. ✅ **Configurar localização** (latitude/longitude)

## Observações Importantes

- O sistema busca **3x o limite** (60 itens) para ranquear e depois retorna os top 20
- Peças próprias são **sempre excluídas**
- Peças em uso (`in_use = true`) não aparecem
- Se não houver favoritos nem aluguéis, mostra peças de todas as categorias

