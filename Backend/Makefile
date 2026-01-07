# Makefile
.PHONY: help test test-cov clean

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install-test:  ## Instala dependências de teste
	pip install -r requirements-test.txt

test-unit:  ## Roda apenas testes unitários
	cd app && pytest -m unit

test:
	docker-compose exec api pytest

test-cov:
	docker-compose exec api pytest --cov=app --cov-report=term --cov-report=html

test-file:
	docker-compose exec api pytest tests/$(FILE) -v

clean:  ## Limpa cache
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name ".coverage" -delete 2>/dev/null || true

coverage-report:  ## Abre relatório de cobertura
	open app/htmlcov/index.html