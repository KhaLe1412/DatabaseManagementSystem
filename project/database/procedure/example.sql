USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS insert_example//

CREATE PROCEDURE insert_example(
    IN p_emp_id INT,
    IN p_emp_name VARCHAR(50),
    IN p_emp_salary DECIMAL(10, 2)
)
BEGIN
    INSERT INTO example (emp_id, emp_name, emp_salary)
    VALUES (p_emp_id, p_emp_name, p_emp_salary);
END//

DELIMITER ;