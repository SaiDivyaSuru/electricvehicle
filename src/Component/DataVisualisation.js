import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const ElectricVehicleDataVisualization = () => {
  const [data, setData] = useState([]);
  const [stateData, setStateData] = useState({});
  const [cityData, setCityData] = useState({});
  const [modelYearData, setModelYearData] = useState({});
  const [evTypeData, setEvTypeData] = useState({});
  const [cafvData, setCafvData] = useState({});
  const [makeData, setMakeData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/Electric_Vehicle_Population_Data.csv');
        const parsedData = Papa.parse(response.data, { header: true });

        if (parsedData.errors.length) {
          console.error('Error parsing CSV:', parsedData.errors);
          return;
        }

        const vehicles = parsedData.data;
        setData(vehicles);
        processData(vehicles);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const processData = (vehicles) => {
    const stateCounts = {};
    const cityCounts = {};
    const yearCounts = {};
    const evTypeCounts = {};
    const cafvCounts = {};
    const makeCounts = { TESLA: 0, NISSAN: 0, Other: 0 };

    vehicles.forEach(vehicle => {
      const { State, City, 'Model Year': modelYear, 'Electric Vehicle Type': evType, 'Clean Alternative Fuel Vehicle Eligibility': cafv, Make } = vehicle;

      stateCounts[State] = (stateCounts[State] || 0) + 1;
      cityCounts[City] = (cityCounts[City] || 0) + 1;
      yearCounts[modelYear] = (yearCounts[modelYear] || 0) + 1;
      evTypeCounts[evType] = (evTypeCounts[evType] || 0) + 1;
      cafvCounts[cafv] = (cafvCounts[cafv] || 0) + 1;

      if (Make === 'TESLA') {
        makeCounts.TESLA += 1;
      } else if (Make === 'NISSAN') {
        makeCounts.NISSAN += 1;
      } else {
        makeCounts.Other += 1;
      }
    });

    setStateData(stateCounts);
    setCityData(cityCounts);
    setModelYearData(yearCounts);
    setEvTypeData(evTypeCounts);
    setCafvData(cafvCounts);
    setMakeData(makeCounts);
  };

  const chartData = (dataObject) => {
    const labels = Object.keys(dataObject);
    const values = Object.values(dataObject);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Percentage of Vehicles',
          data: values.map(value => (value / data.length) * 100),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  const pieChartData = {
    labels: Object.keys(makeData),
    datasets: [
      {
        data: Object.values(makeData),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const chartOptionsWithLabels = {
    responsive: true,
    maintainAspectRatio: false,
    animations: {
      tension: {
        duration: 1000,
        easing: 'easeInOutQuad',
        from: 1,
        to: 0,
        loop: true,
      },
      scale: {
        duration: 500,
        from: 0,
        to: 1,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value) => {
          return value.toFixed(2) + '%';
        },
        color: '#000',
      },
    },
    elements: {
      bar: {
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.2)',
      },
      arc: {
        hoverBackgroundColor: '#FF6384',
      },
    },
  };

  const chartOptionsWithoutLabels = {
    ...chartOptionsWithLabels,
    plugins: {
      ...chartOptionsWithLabels.plugins,
      datalabels: {
        display: false,
      },
    },
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
      <h1 style={{
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '3em',
        color: '#fff',
        background: 'linear-gradient(90deg, #FF6F61, #6FA3EF)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s, background 0.3s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }} 
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}>
        Electric Vehicle DashBoard
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: '20px' }}>
        {[ 
          { title: 'Percentage of Electric Vehicles by State', data: chartData(stateData), options: chartOptionsWithoutLabels },
          { title: 'Percentage of Electric Vehicles by City', data: chartData(cityData), options: chartOptionsWithoutLabels },
          { title: 'Percentage of Electric Vehicles by Model Year', data: chartData(modelYearData), options: chartOptionsWithLabels },
          { title: 'Percentage of Vehicles by Electric Vehicle Type', data: chartData(evTypeData), options: chartOptionsWithLabels },
          { title: 'Percentage of Vehicles by Clean Alternative Fuel Vehicle Eligibility', data: chartData(cafvData), options: chartOptionsWithoutLabels },
          { title: 'Percentage of Electric Vehicles by Make (Tesla, Nissan, Others)', data: pieChartData, options: { responsive: true, maintainAspectRatio: false } },
        ].map((chart, index) => (
          <div key={index} className="chart-container" style={{ 
            width: '48%', 
            height: '400px', 
            margin: '10px 0', 
            padding: '10px', 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}>
            <h2 style={{ fontSize: '1.4em', textAlign: 'center', color: '#555', marginBottom: '10px' }}>{chart.title}</h2>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {chart.title.includes('by Make') ? (
                <Pie data={chart.data} options={chart.options} />
              ) : (
                <Bar data={chart.data} options={chart.options} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectricVehicleDataVisualization;
