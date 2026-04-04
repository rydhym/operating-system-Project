document.addEventListener('DOMContentLoaded', () => {
    const algorithmSelect = document.getElementById('algorithm');
    const quantumContainer = document.getElementById('quantum-container');
    const addProcessBtn = document.getElementById('add-process');
    const processList = document.getElementById('process-list');
    const runBtn = document.getElementById('run-simulation');
    const resultsArea = document.getElementById('results');
    const ganttChart = document.getElementById('gantt-chart');
    const statsTableBody = document.querySelector('#stats-table tbody');
    const compareResultsArea = document.getElementById('compare-results');
    const compareTableBody = document.querySelector('#compare-table tbody');
    const processRowTemplate = document.getElementById('process-row-template');
    const compareBtn = document.getElementById('compare-all');

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

    runBtn.addEventListener('click', () => {
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

        const q = (algorithm === '2' || algorithm === '8') ? quantum : '1';

        try {
            const data = runScheduler(algorithm, q, lastInstant, processes);
            renderResults(data);
            compareResultsArea.style.display = 'none';
            resultsArea.style.display = 'block';
            resultsArea.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            alert('Error running simulation: ' + err.message);
        }
    });

    compareBtn.addEventListener('click', () => {
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

        compareTableBody.innerHTML = '';
        const allResults = [];

        for (let i = 1; i <= 8; i++) {
            const algoId = i.toString();
            const q = (algoId === '2' || algoId === '8') ? quantum : '1';
            try {
                const data = runScheduler(algoId, q, lastInstant, processes);
                
                let sumTurnaround = 0;
                let sumWaiting = 0;
                let sumNormTurn = 0;
                
                data.processes.forEach(proc => {
                    sumTurnaround += proc.turnaround;
                    sumWaiting += (proc.turnaround - proc.service);
                    sumNormTurn += proc.normTurn;
                });

                const count = data.processes.length;
                allResults.push({
                    name: data.algorithm,
                    avgTurn: sumTurnaround / count,
                    avgWait: sumWaiting / count,
                    avgNorm: sumNormTurn / count
                });
            } catch(e) {}
        }

        // Sort by average waiting time to show the best at the top
        allResults.sort((a, b) => a.avgWait - b.avgWait);

        allResults.forEach((res, index) => {
            const tr = document.createElement('tr');
            // Highlight the best algorithm (index 0)
            if (index === 0) {
                tr.classList.add('bg-primary/10');
            }
            tr.innerHTML = `
                <td class="font-bold ${index === 0 ? 'text-primary' : ''}">${res.name} ${index === 0 ? '🏆' : ''}</td>
                <td>${res.avgTurn.toFixed(2)}</td>
                <td class="font-bold ${index === 0 ? 'text-[#4edea3]' : 'text-[#ff9f43]'}">${res.avgWait.toFixed(2)}</td>
                <td>${res.avgNorm.toFixed(2)}</td>
            `;
            compareTableBody.appendChild(tr);
        });

        resultsArea.style.display = 'none';
        compareResultsArea.style.display = 'block';
        compareResultsArea.scrollIntoView({ behavior: 'smooth' });
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
        let totalTurnaround = 0;
        let totalWaiting = 0;
        let totalNormTurn = 0;

        data.processes.forEach(proc => {
            const tr = document.createElement('tr');
            const waitingTime = proc.turnaround - proc.service;
            
            totalTurnaround += proc.turnaround;
            totalWaiting += waitingTime;
            totalNormTurn += proc.normTurn;

            tr.innerHTML = `
                <td>${proc.name}</td>
                <td>${proc.arrival}</td>
                <td>${proc.service}</td>
                <td>${proc.finish}</td>
                <td>${proc.turnaround}</td>
                <td>${waitingTime}</td>
                <td>${proc.normTurn.toFixed(2)}</td>
            `;
            statsTableBody.appendChild(tr);
        });

        const count = data.processes.length;
        if (count > 0) {
            const trAvg = document.createElement('tr');
            trAvg.classList.add('bg-surface-container-high/50', 'font-bold');
            trAvg.innerHTML = `
                <td colspan="4" class="text-right text-xs tracking-widest uppercase text-slate-500">Averages</td>
                <td class="text-primary">${(totalTurnaround/count).toFixed(2)}</td>
                <td class="text-[#ff9f43]">${(totalWaiting/count).toFixed(2)}</td>
                <td class="text-[#4edea3]">${(totalNormTurn/count).toFixed(2)}</td>
            `;
            statsTableBody.appendChild(trAvg);
        }
    }
});
