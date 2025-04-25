const supabase = window.supabase;
if (!supabase) {
    console.error("Supabase is not loaded.");
}

const supabaseClient = supabase.createClient(
    'https://xaviosikcqoajctjones.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ'
);

let chart; // global chart instance

async function fetchIntakeData() {
    const user = await supabaseClient.auth.getUser();
    if (!user || !user.data.user) {
        console.error("User not logged in");
        return;
    }

    const userId = user.data.user.id;
    const { data, error } = await supabaseClient
        .from('table2')
        .select('calorie_goal, intake, intake_1_day_ago, intake_2_days_ago, intake_3_days_ago, intake_4_days_ago, intake_5_days_ago')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    return data;
}

function getChartOptions(isLightMode, calorie_goal, intakeValues) {
    const textColor = isLightMode ? 'black' : 'white';
    const gridColor = isLightMode ? '#ccc' : '#444';

    return {
        indexAxis: 'x',
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Calories',
                    color: textColor,
                    font: { size: 28 }
                },
                ticks: {
                    color: textColor,
                    font: { size: 28 }
                },
                grid: {
                    color: gridColor
                },
                suggestedMax: calorie_goal
            },
            x: {
                ticks: {
                    color: textColor,
                    font: { size: 23 }
                },
                grid: {
                    color: gridColor
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: { size: 20 }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                titleFont: { size: 20 },
                bodyFont: { size: 20 },
                callbacks: {
                    label: function (context) {
                        return intakeValues[context.dataIndex] === null ? 'No data' : `Calories: ${context.raw}`;
                    }
                }
            },
            datalabels: {
                color: textColor,
                font: {
                    weight: 'bold',
                    size: 20
                },
                formatter: function (value, context) {
                    const originalValue = intakeValues[context.dataIndex];
                    return originalValue === null ? 'No data' : value;
                },
                anchor: 'end',
                align: 'start',
                offset: -10
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: true
        },
        elements: {
            bar: {
                barPercentage: 0.6,
                categoryPercentage: 1.0,
                barThickness: 50
            }
        }
    };
}

async function renderChart() {
    const data = await fetchIntakeData();
    if (!data) return;

    const {
        calorie_goal, intake, intake_1_day_ago,
        intake_2_days_ago, intake_3_days_ago,
        intake_4_days_ago, intake_5_days_ago
    } = data;

    const labels = ['Today', '1 Day Ago', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago'];
    const intakeValues = [intake, intake_1_day_ago, intake_2_days_ago, intake_3_days_ago, intake_4_days_ago, intake_5_days_ago];

    const processedValues = intakeValues.map(value => value ?? 0);
    const barColors = processedValues.map(value => value > calorie_goal ? 'red' : 'blue');

    const ctx = document.getElementById('calorieChart').getContext('2d');
    const isLightMode = document.body.classList.contains('light-mode');

    if (chart) {
        chart.destroy(); // prevent overlapping charts
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Calorie Intake',
                data: processedValues,
                backgroundColor: barColors,
                borderColor: 'black',
                borderWidth: 1
            }]
        },
        options: getChartOptions(isLightMode, calorie_goal, intakeValues),
        plugins: [ChartDataLabels]
    });
}

// Initial render
document.addEventListener('DOMContentLoaded', renderChart);

// Re-render chart when theme changes
document.getElementById('mode-toggle')?.addEventListener('change', () => {
    setTimeout(renderChart, 100); // slight delay for CSS class change to apply
});
