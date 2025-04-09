// Remove the import statement since we are using the CDN version
// Use the globally available `supabase` object
const supabase = window.supabase;
if (!supabase) {
    console.error("Supabase is not loaded.");
}

const supabaseClient = supabase.createClient('https://xaviosikcqoajctjones.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhdmlvc2lrY3FvYWpjdGpvbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzEzMTUsImV4cCI6MjAzOTY0NzMxNX0.VGaVkW2Pb6J2Cgpw-1pNbXUW5cWPykgXAXt5kn-ggaQ');

async function fetchIntakeData() {
    const user = await supabaseClient.auth.getUser();
    if (!user || !user.data.user) {
        console.error("User not logged in");
        return;
    }

    const userId = user.data.user.id;
    const { data, error } = await supabaseClient
        .from('table2')
        .select('calorie_goal, intake_1_day_ago, intake_2_days_ago, intake_3_days_ago, intake_4_days_ago, intake_5_days_ago')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    return data;
}

async function renderChart() {
    const data = await fetchIntakeData();
    if (!data) return;

    const { calorie_goal, intake_1_day_ago, intake_2_days_ago, intake_3_days_ago, intake_4_days_ago, intake_5_days_ago } = data;
    const labels = ['1 Day Ago', '2 Days Ago', '3 Days Ago', '4 Days Ago', '5 Days Ago'];
    const intakeValues = [intake_1_day_ago, intake_2_days_ago, intake_3_days_ago, intake_4_days_ago, intake_5_days_ago];
    const processedValues = intakeValues.map(value => value ?? 0);
    const barColors = processedValues.map(value => value > calorie_goal ? 'red' : 'blue');

    const ctx = document.getElementById('calorieChart').getContext('2d');

    new Chart(ctx, {
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
        options: {
            indexAxis: 'x',
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Calories',
                        color: 'white',
                        font: { size: 28 }
                    },
                    ticks: {
                        color: 'white',
                        font: { size: 28 }
                    },
                    suggestedMax: calorie_goal
                },
                x: {
                    ticks: {
                        color: 'white',
                        font: { size: 23 }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: { size: 20 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            return intakeValues[context.dataIndex] === null ? 'No data' : `Calories: ${context.raw}`;
                        }
                    },
                    titleFont: { size: 20 },
                    bodyFont: { size: 20 }
                },
                datalabels: {
                    color: 'white',
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
        },
        plugins: [ChartDataLabels]
    });
}

document.addEventListener('DOMContentLoaded', renderChart);
