INSERT INTO customers2 (id, name, amount, birth_year, documents, postal_code, email)
VALUES
('1000', 'João Silva', '-5.2376', '15/10/1993', '12345678901', '345678', 'joao@email.com'),
('200', 'Maria Souza', '23.123', '15/10/2010', '12345678901', '12345678', 'maria@email.com'),
('300', 'João Silva', '14.32', '15/10/1524', '12345678901', '12345678', 'joao1@email.com');

INSERT INTO phones3 (order_id, customer_id)
VALUES
('1', 1000),
('2', 200);

