document.addEventListener('DOMContentLoaded', () => {
    const algorithmSelect = document.getElementById('algorithm');
    const quantumContainer = document.getElementById('quantum-container');
    const addProcessBtn = document.getElementById('add-process');
    const processList = document.getElementById('process-list');
    const runBtn = document.getElementById('run-simulation');
    const resultsArea = document.getElementById('results');
    const ganttChart = document.getElementById('gantt-chart');
    const statsTableBody = document.querySelector('#stats-table tbody');
    const processRowTemplate = document.getElementById('process-row-template');

    // Show/hide quantum based on algorithm
    algorithmSelect.addEventListener('change', () => {
        const val = algorithmSelect.value;
        // RR (2) and Aging (8) need quantum
        if (val === '2' || val === '8') {
            quantumContainer.style.display = 'flex';
        } else {
            quantumContainer.style.display = 'none';
        }
    });

    // Add initial processes
    const addProcess = (name = '', arrival = 0, service = 1) => {
        const clone = processRowTemplate.content.cloneNode(true);
        const nameInput = clone.querySelector('.proc-name');
        const arrivalInput = clone.querySelector('.proc-arrival');
        const serviceInput = clone.querySelector('.proc-service');
        
        nameInput.value = name || `P${processList.children.length}`;
        arrivalInput.value = arrival;
        serviceInput.value = service;

        clone.querySelector('.remove-process').addEventListener('click', (e) => {
            e.target.closest('.process-item').remove();
        });

        processList.appendChild(clone);
    };

    // Add 3 initial processes for demo
    addProcess('P1', 0, 3);
    addProcess('P2', 2, 4);
    addProcess('P3', 4, 2);

    addProcessBtn.addEventListener('click', () => addProcess());

    runBtn.addEventListener('click', async () => {
        const algorithm = algorithmSelect.value;
        const quantum = document.getElementById('quantum').value;
        const lastInstant = document.getElementById('last-instant').value;
        
        const processes = [];
        const rows = processList.querySelectorAll('.process-item:not(.header)');
        rows.forEach(row => {
            processes.push({
                name: row.querySelector('.proc-name').value || 'P?',
                arrival: parseInt(row.querySelector('.proc-arrival').value) || 0,
                service: parseInt(row.querySelector('.proc-service').value) || 1
            });
        });

        const requestData = {
            algorithm,
            quantum: (algorithm === '2' || algorithm === '8') ? quantum : '1',
            lastInstant,
            processes
        };

        runBtn.disabled = true;
        runBtn.textContent = 'Running...';

        try {
            const response = await fetch('/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) throw new Error('Simulation failed');

            const data = await response.json();
            renderResults(data);
            resultsArea.style.display = 'block';
            resultsArea.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            alert('Error running simulation: ' + err.message);
        } finally {
            runBtn.disabled = false;
            runBtn.textContent = 'Run Simulation';
        }
    });

    function renderResults(data) {
        // Render Gantt Chart
        ganttChart.innerHTML = '';
        
        data.processes.forEach((proc, pIdx) => {
            const row = document.createElement('div');
            row.className = 'gantt-row';
            
            const label = document.createElement('div');
            label.className = 'proc-label';
            label.textContent = proc.name;
            row.appendChild(label);

            const blocks = document.createElement('div');
            blocks.className = 'gantt-blocks';

            data.timeline.forEach((step, tIdx) => {
                const block = document.createElement('div');
                block.className = 'block';
                const status = step[pIdx];
                
                if (status === '*') {
                    block.classList.add('running');
                } else if (status === '.') {
                    block.classList.add('waiting');
                }
                
                block.title = `Time ${tIdx}: ${status === '*' ? 'Running' : (status === '.' ? 'Waiting' : 'Idle')}`;
                blocks.appendChild(block);
            });
            
            row.appendChild(blocks);
            ganttChart.appendChild(row);
        });

        // Add timeline markers
        const markersRow = document.createElement('div');
        markersRow.className = 'gantt-row markers';
        markersRow.innerHTML = '<div class="proc-label"></div>';
        const markersContainer = document.createElement('div');
        markersContainer.className = 'gantt-blocks';
        data.timeline.forEach((_, i) => {
            const marker = document.createElement('div');
            marker.className = 'block marker';
            marker.textContent = i;
            marker.style.color = 'var(--text-muted)';
            marker.style.fontSize = '0.7rem';
            markersContainer.appendChild(marker);
        });
        markersRow.appendChild(markersContainer);
        ganttChart.appendChild(markersRow);

        // Render Statistics Table
        statsTableBody.innerHTML = '';
        data.processes.forEach(proc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${proc.name}</td>
                <td>${proc.arrival}</td>
                <td>${proc.service}</td>
                <td>${proc.finish}</td>
                <td>${proc.turnaround}</td>
                <td>${proc.normTurn.toFixed(2)}</td>
            `;
            statsTableBody.appendChild(tr);
        });
    }
});
