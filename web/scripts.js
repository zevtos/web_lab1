let tableCreated = false;

function sendData() {
    const x = document.getElementById('x').value;
    const y = document.getElementById('y').value;
    const r = document.getElementById('r').value;

    if (!validateInput(x, y, r)) {
        return;
    }

    const data = JSON.stringify({x: parseFloat(x), y: parseFloat(y), r: parseFloat(r)});

    fetch('/fcgi-bin/server.jar', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: data
    })
        .then(response => response.json())
        .then(json => {
            if (!tableCreated) {
                createTable();
                tableCreated = true;
            }
            addRow(json);
        })
        .catch(error => console.error('Error:', error));
}

function createTable() {
    const resultContainer = document.getElementById('results');
    const table = document.createElement('table');
    table.setAttribute('id', 'resultTable');
    table.innerHTML = `
        <tr>
            <th>X</th>
            <th>Y</th>
            <th>R</th>
            <th>Result</th>
            <th>Current Time</th>
            <th>Execution Time</th>
        </tr>
    `;
    resultContainer.appendChild(table);
}

function addRow(json) {
    const resultTable = document.getElementById('resultTable');

    // Создаем новую строку с результатами
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${json.x}</td>
        <td>${json.y}</td>
        <td>${json.r}</td>
        <td>${json.result}</td>
        <td>${json.currentTime}</td>
        <td>${json.executionTime}</td>
    `;
    resultTable.appendChild(newRow);

    // Сохраняем результат в localStorage
    let results = JSON.parse(localStorage.getItem('results')) || [];
    results.push(json);
    localStorage.setItem('results', JSON.stringify(results));
}


function validateInput(x, y, r) {
    const errorMessage = document.getElementById('error-message');

    // Проверка на корректность введенных значений
    if (isNaN(x) || isNaN(y) || isNaN(r) || r < 1 || r > 5) {
        // Если данные некорректны, показываем сообщение об ошибке
        errorMessage.textContent = 'Invalid input values. Please enter correct X, Y, and R values.';
        errorMessage.style.display = 'block';
        return false;
    }

    // Если данные корректны, скрываем сообщение об ошибке
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    return true;
}


function drawCoordinateSystem() {
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    // Задаем размеры canvas, чтобы они соответствовали его контейнеру
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientWidth; // Соотношение 1:1

    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Центр канваса (центр системы координат)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = canvas.width / 4; // Масштаб для отображения R (динамически)

    // Рисуем закрашенные области

    // Треугольник: (0, 0), (-R, 0), (0, R) (в левом верхнем углу)
    ctx.fillStyle = "#4a90e2";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY); // (0, 0)
    ctx.lineTo(centerX - scale, centerY); // (-R, 0)
    ctx.lineTo(centerX, centerY - scale); // (0, R)
    ctx.closePath();
    ctx.fill();

    // Четверть круга: с центром в (0, 0), радиус R/2 (в левом нижнем углу)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY); // Начальная точка в центре
    ctx.arc(centerX, centerY, scale / 2, Math.PI, 0.5 * Math.PI, true); // Дуга от 180° до 270°
    ctx.lineTo(centerX, centerY); // Возвращаемся к центру
    ctx.closePath();
    ctx.fill();


    // Прямоугольник: от (0, 0) до (R, -R/2) (в правом нижнем углу)
    ctx.beginPath();
    ctx.rect(centerX, centerY, scale, scale / 2);
    ctx.closePath();
    ctx.fill();

    // Рисуем оси координат
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    // Ось X
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Ось Y
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Рисуем отметки на осях для R
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000";

    // Отметки по оси X
    ctx.fillText("R", centerX + scale - 10, centerY + 20); // R
    ctx.fillText("R/2", centerX + scale / 2 - 20, centerY + 20); // R/2
    ctx.fillText("-R", centerX - scale - 20, centerY + 20); // -R
    ctx.fillText("-R/2", centerX - scale / 2 - 30, centerY + 20); // -R/2

    // Отметки по оси Y
    ctx.fillText("R", centerX - 20, centerY - scale + 10); // R
    ctx.fillText("R/2", centerX - 30, centerY - scale / 2 + 10); // R/2
    ctx.fillText("-R/2", centerX - 30, centerY + scale / 2 + 10); // -R/2
}

function loadResults() {
    const results = JSON.parse(localStorage.getItem('results')) || [];
    if (results.length > 0) {
        createTable(); // Создаём таблицу, если её ещё нет
        results.forEach(result => addRow(result));
        tableCreated = true; // Указываем, что таблица создана
    }
}

window.onload = function() {
    drawCoordinateSystem(); // Рисуем систему координат
    loadResults();          // Загружаем результаты из localStorage
};

