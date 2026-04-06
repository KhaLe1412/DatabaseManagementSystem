USE dbms_project;

INSERT IGNORE INTO example (emp_id, emp_name, emp_salary) VALUES
(1, 'Alice',   70000.00),
(2, 'Bob',     80000.00),
(3, 'Charlie', 90000.00);

CALL insert_example(4, 'David', 75000.00);