'use client';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function SentimentGauge({
  value,
  min = 0,
  max = 100,
  label,
  invertColor = false,
  description
}: {
  value: number;
  min?: number;
  max?: number;
  label: string;
  invertColor?: boolean;
  description?: string;
}) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  // If invertColor: high value = red (e.g. VIX). Normal: high value = green (e.g. Greed)
  // We'll use our palette variables dynamically if possible, but Chart.js needs hex/rgba.
  // We can just use standard colors and rely on CSS for the text.
  let color = '#EEFF50'; // Yellow
  if ((percentage > 70 && !invertColor) || (percentage < 30 && invertColor)) {
    color = '#00FF62'; // Green
  } else if ((percentage < 30 && !invertColor) || (percentage > 70 && invertColor)) {
    color = '#FF2D6B'; // Red/Pink
  }

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, 'rgba(128, 128, 128, 0.2)'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '80%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '200px', height: '100px' }}>
        <Doughnut data={data} options={options} />
        <div style={{
          position: 'absolute', top: '70%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {value.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
        </div>
      </div>
      {description && <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>{description}</div>}
    </div>
  );
}
