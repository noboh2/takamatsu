// 月選択肢を生成
const monthSelect = document.getElementById('monthSelect');
const currentYear = new Date().getFullYear();
// 2026年3月まで選択できるように修正
const endYear = 2026;
const endMonth = 2; // 0が1月なので、2は3月

for (let year = currentYear; year <= endYear; year++) {
    const startMonth = (year === currentYear) ? new Date().getMonth() : 0;
    const lastMonth = (year === endYear) ? endMonth : 11;
    for (let i = startMonth; i <= lastMonth; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `${year}年 ${i + 1}月`;
        monthSelect.add(option);
    }
}

// 初期表示は現在の月
monthSelect.value = new Date().getMonth();

// 勤怠データを格納する配列 (ローカルストレージから読み込むか、新規作成)
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};

// テーブルを生成
generateTable();

function generateTable() {
    const selectedMonth = parseInt(monthSelect.value);
    //月選択で何年のデータか判定する
    const selectedYear = parseInt(monthSelect.options[monthSelect.selectedIndex].text.split("年")[0]);
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const tableBody = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(selectedYear, selectedMonth, i);
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

        const row = tableBody.insertRow();
        const dateCell = row.insertCell();
        const dayOfWeekCell = row.insertCell();
        const startTimeCell = row.insertCell();
        const breakStartTimeCell = row.insertCell();
        const breakEndTimeCell = row.insertCell();
        const endTimeCell = row.insertCell();
        const locationCell = row.insertCell();
        const actionCell = row.insertCell();

        dateCell.textContent = `${selectedMonth + 1}/${i}`;
        dayOfWeekCell.textContent = dayOfWeek;

        const dataKey = `${selectedYear}-${selectedMonth + 1}-${i}`;

        // 15分単位のセレクトボックスを生成する関数
        const createTimeSelect = (defaultValue) => {
            const select = document.createElement('select');
            select.className = 'time-select';
            for (let hour = 0; hour < 24; hour++) {
                for (let min = 0; min < 60; min += 15) {
                    const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                    const option = document.createElement('option');
                    option.value = timeStr;
                    option.text = timeStr;
                    if (timeStr === defaultValue) {
                        option.selected = true;
                    }
                    select.add(option);
                }
            }
            return select;
        };

        startTimeCell.appendChild(createTimeSelect(attendanceData[dataKey]?.startTime));
        breakStartTimeCell.appendChild(createTimeSelect(attendanceData[dataKey]?.breakStartTime));
        breakEndTimeCell.appendChild(createTimeSelect(attendanceData[dataKey]?.breakEndTime));
        endTimeCell.appendChild(createTimeSelect(attendanceData[dataKey]?.endTime));
        locationCell.innerHTML = `<input type="text" value="${attendanceData[dataKey]?.location || ''}">`;

        // 保存ボタン
        const saveButton = document.createElement('button');
        saveButton.textContent = '保存';
        saveButton.className = 'save-button';
        saveButton.onclick = () => saveData(dataKey, row);
        actionCell.appendChild(saveButton);

        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'delete-button';
        deleteButton.onclick = () => deleteRow(dataKey);
        actionCell.appendChild(deleteButton);
    }
}

function changeMonth() {
    generateTable();
}

function saveData(dataKey, row) {
    attendanceData[dataKey] = {
        startTime: row.cells[2].children[0].value,
        breakStartTime: row.cells[3].children[0].value,
        breakEndTime: row.cells[4].children[0].value,
        endTime: row.cells[5].children[0].value,
        location: row.cells[6].children[0].value,
    };

    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    alert(`${dataKey} のデータを保存しました`);
}

function deleteRow(dataKey) {
    if (confirm(`${dataKey} のデータを削除しますか？`)) {
        delete attendanceData[dataKey];
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        generateTable();
    }
}