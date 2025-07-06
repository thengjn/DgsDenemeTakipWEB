// DGS Deneme Takip Web Uygulaması
class DgsTracker {
    constructor() {
        this.exams = this.loadExams();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.startCountdown();
        this.setTodayDate();
        // Chart.js yüklenene kadar bekle
        this.waitForChartJS();
    }

    setupEventListeners() {
        const form = document.getElementById('examForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Window resize event listener for responsive charts
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('examDate').value = today;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            examName: document.getElementById('examName').value,
            examDate: document.getElementById('examDate').value,
            numericalCorrect: parseInt(document.getElementById('numericalCorrect').value),
            numericalIncorrect: parseInt(document.getElementById('numericalIncorrect').value),
            numericalTotal: parseInt(document.getElementById('numericalTotal').value),
            verbalCorrect: parseInt(document.getElementById('verbalCorrect').value),
            verbalIncorrect: parseInt(document.getElementById('verbalIncorrect').value),
            verbalTotal: parseInt(document.getElementById('verbalTotal').value),
            timeTaken: parseInt(document.getElementById('timeTaken').value)
        };

        // Validation
        const validation = this.validateForm(formData);
        if (!validation.isValid) {
            this.showError(validation.message);
            return;
        }

        // Calculate nets
        const numericalNet = this.calculateNet(formData.numericalCorrect, formData.numericalIncorrect);
        const verbalNet = this.calculateNet(formData.verbalCorrect, formData.verbalIncorrect);
        const overallNet = numericalNet + verbalNet;

        // Calculate average time per question
        const totalQuestions = formData.numericalTotal + formData.verbalTotal;
        const averageTimePerQuestion = totalQuestions > 0 ? (formData.timeTaken * 60) / totalQuestions : 0;

        const exam = {
            id: Date.now(),
            ...formData,
            numericalNet,
            verbalNet,
            overallNet,
            averageTimePerQuestion,
            timestamp: new Date(formData.examDate).getTime()
        };

        this.exams.push(exam);
        this.saveExams();
        this.updateDisplay();
        this.clearForm();
        this.showSuccess('Deneme başarıyla eklendi!');
    }

    validateForm(data) {
        if (!data.examName.trim()) {
            return { isValid: false, message: 'Deneme adı boş olamaz' };
        }

        if (data.numericalCorrect < 0 || data.numericalIncorrect < 0 || 
            data.verbalCorrect < 0 || data.verbalIncorrect < 0) {
            return { isValid: false, message: 'Doğru ve yanlış sayıları negatif olamaz' };
        }

        if (data.numericalCorrect + data.numericalIncorrect > data.numericalTotal) {
            return { isValid: false, message: 'Sayısal doğru+yanlış toplam soru sayısından büyük olamaz' };
        }

        if (data.verbalCorrect + data.verbalIncorrect > data.verbalTotal) {
            return { isValid: false, message: 'Sözel doğru+yanlış toplam soru sayısından büyük olamaz' };
        }

        if (data.timeTaken <= 0) {
            return { isValid: false, message: 'Süre pozitif bir değer olmalıdır' };
        }

        return { isValid: true };
    }

    calculateNet(correct, incorrect) {
        return Math.round((correct - (incorrect / 4)) * 100) / 100;
    }

    updateDisplay() {
        this.updateStatistics();
        this.updateExamList();
        this.updateCharts();
        this.toggleChartsVisibility();
    }

    updateStatistics() {
        const totalExams = this.exams.length;
        const avgNet = totalExams > 0 ? this.exams.reduce((sum, exam) => sum + exam.overallNet, 0) / totalExams : 0;
        const bestNet = totalExams > 0 ? Math.max(...this.exams.map(exam => exam.overallNet)) : 0;
        const worstNet = totalExams > 0 ? Math.min(...this.exams.map(exam => exam.overallNet)) : 0;

        document.getElementById('totalExams').textContent = totalExams;
        document.getElementById('averageNet').textContent = avgNet.toFixed(2);
        document.getElementById('bestNet').textContent = bestNet.toFixed(2);
        document.getElementById('worstNet').textContent = worstNet.toFixed(2);
    }

    updateExamList() {
        const examList = document.getElementById('examList');
        
        if (this.exams.length === 0) {
            examList.innerHTML = `
                <div class="empty-state">
                    <p>Henüz deneme eklenmedi. Yukarıdaki formu kullanarak ilk denemenizi ekleyin.</p>
                </div>
            `;
            return;
        }

        // Sort exams by date (newest first)
        const sortedExams = [...this.exams].sort((a, b) => b.timestamp - a.timestamp);

        examList.innerHTML = sortedExams.map(exam => `
            <div class="exam-item">
                <button class="delete-btn" onclick="window.dgsTracker.deleteExam(${exam.id})" title="Sil">×</button>
                <div class="exam-header">
                    <div>
                        <div class="exam-name">${exam.examName}</div>
                        <div class="exam-date">${this.formatDate(exam.examDate)}</div>
                    </div>
                </div>
                <div class="net-scores">
                    <div class="net-score numerical">
                        <span class="net-value">${exam.numericalNet.toFixed(2)}</span>
                        <span class="net-label">Sayısal Net</span>
                    </div>
                    <div class="net-score verbal">
                        <span class="net-value">${exam.verbalNet.toFixed(2)}</span>
                        <span class="net-label">Sözel Net</span>
                    </div>
                    <div class="net-score total">
                        <span class="net-value">${exam.overallNet.toFixed(2)}</span>
                        <span class="net-label">Toplam Net</span>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    <span>Süre: ${exam.timeTaken} dk</span>
                    <span>Soru/Süre: ${exam.averageTimePerQuestion.toFixed(1)} sn</span>
                </div>
            </div>
        `).join('');
    }

    deleteExam(id) {
        if (confirm('Bu deneme sonucunu silmek istediğinizden emin misiniz?')) {
            this.exams = this.exams.filter(exam => exam.id !== id);
            this.saveExams();
            this.updateDisplay();
            this.showSuccess('Deneme silindi!');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    startCountdown() {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const dgsDate = new Date('2025-07-20T10:00:00').getTime();
            const difference = dgsDate - now;

            // DOM elementlerinin var olduğunu kontrol et
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');

            if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
                console.log('Countdown elementleri henüz yüklenmedi, tekrar denenecek...');
                return;
            }

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                daysEl.textContent = String(days).padStart(2, '0');
                hoursEl.textContent = String(hours).padStart(2, '0');
                minutesEl.textContent = String(minutes).padStart(2, '0');
                secondsEl.textContent = String(seconds).padStart(2, '0');
            } else {
                const countdownEl = document.querySelector('.countdown');
                if (countdownEl) {
                    countdownEl.innerHTML = `
                        <h2>🎉 DGS Sınavı Gerçekleşti!</h2>
                    `;
                }
            }
        };

        // İlk çalıştırma
        updateCountdown();
        // Her saniye güncelle
        setInterval(updateCountdown, 1000);
    }

    clearForm() {
        document.getElementById('examForm').reset();
        this.setTodayDate();
        // Reset default values
        document.getElementById('numericalTotal').value = '50';
        document.getElementById('verbalTotal').value = '50';
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }

    saveExams() {
        localStorage.setItem('dgsExams', JSON.stringify(this.exams));
    }

    loadExams() {
        const stored = localStorage.getItem('dgsExams');
        return stored ? JSON.parse(stored) : [];
    }

    initializeCharts() {
        // Canvas elementlerinin var olduğunu kontrol et
        const numericalCanvas = document.getElementById('numericalChart');
        const verbalCanvas = document.getElementById('verbalChart');
        const overallCanvas = document.getElementById('overallChart');

        if (!numericalCanvas || !verbalCanvas || !overallCanvas) {
            console.log('Grafik canvas elementleri bulunamadı, grafik başlatılmadı.');
            return;
        }

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Deneme Tarihi'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Net Puan'
                    },
                    beginAtZero: true
                }
            },
            onResize: (chart, size) => {
                // Grafik boyutu değiştiğinde çalışacak
                console.log('Chart resized to:', size.width, 'x', size.height);
            }
        };

        // Sayısal Net Grafiği
        const numericalCtx = numericalCanvas.getContext('2d');
        this.charts.numerical = new Chart(numericalCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sayısal Net',
                    data: [],
                    borderColor: '#1976D2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#1976D2',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });

        // Sözel Net Grafiği
        const verbalCtx = verbalCanvas.getContext('2d');
        this.charts.verbal = new Chart(verbalCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sözel Net',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });

        // Toplam Net Grafiği
        const overallCtx = overallCanvas.getContext('2d');
        this.charts.overall = new Chart(overallCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Toplam Net',
                    data: [],
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#FF9800',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });

        // Grafikler başlatıldıktan sonra verileri güncelle
        this.updateCharts();
        this.toggleChartsVisibility();
    }

    updateCharts() {
        if (this.exams.length === 0) return;
        if (!this.charts.numerical || !this.charts.verbal || !this.charts.overall) {
            console.log('Grafikler henüz başlatılmamış, grafik güncellenmesi atlanıyor.');
            return;
        }

        // Sort exams by date
        const sortedExams = [...this.exams].sort((a, b) => a.timestamp - b.timestamp);

        // Prepare data
        const labels = sortedExams.map(exam => {
            const date = new Date(exam.examDate);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        const numericalData = sortedExams.map(exam => exam.numericalNet);
        const verbalData = sortedExams.map(exam => exam.verbalNet);
        const overallData = sortedExams.map(exam => exam.overallNet);

        // Update Numerical Chart
        this.charts.numerical.data.labels = labels;
        this.charts.numerical.data.datasets[0].data = numericalData;
        this.charts.numerical.update();

        // Update Verbal Chart
        this.charts.verbal.data.labels = labels;
        this.charts.verbal.data.datasets[0].data = verbalData;
        this.charts.verbal.update();

        // Update Overall Chart
        this.charts.overall.data.labels = labels;
        this.charts.overall.data.datasets[0].data = overallData;
        this.charts.overall.update();
    }

    toggleChartsVisibility() {
        const chartsSection = document.getElementById('chartsSection');
        if (this.exams.length >= 2) {
            chartsSection.style.display = 'block';
        } else {
            chartsSection.style.display = 'none';
        }
    }

    waitForChartJS() {
        // Chart.js yüklenene kadar bekle
        const checkChart = () => {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js yüklendi, grafikler başlatılıyor...');
                this.initializeCharts();
            } else {
                console.log('Chart.js henüz yüklenmedi, 100ms sonra tekrar denenecek...');
                setTimeout(checkChart, 100);
            }
        };
        checkChart();
    }

    handleResize() {
        // Grafiklerin yeniden boyutlandırılmasını sağla
        if (this.charts.numerical) {
            this.charts.numerical.resize();
        }
        if (this.charts.verbal) {
            this.charts.verbal.resize();
        }
        if (this.charts.overall) {
            this.charts.overall.resize();
        }
    }
}

// Initialize the app when the page loads
let dgsTracker;
document.addEventListener('DOMContentLoaded', () => {
    dgsTracker = new DgsTracker();
    // Global scope'a ekle ki HTML onclick çalışsın
    window.dgsTracker = dgsTracker;
}); 