import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
const addPDFHeader = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
 
  doc.setFillColor(0, 82, 204); // Jira blue
  doc.rect(0, 0, pageWidth, 60, 'F');

  // 2. Add your logo (favicon)
  const logoUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Y3dj3QCsR32b0r-Oiif92n9-5r8QllkcdQ&s'; // ← change to production URL later!
  
  const logoX = 15;
  const logoY = 12;
  const logoWidth = 36;   // slightly smaller to fit nicely
  const logoHeight = 36;  // square favicon usually looks good

  try {
    doc.addImage(
      logoUrl,
      'ICO',           // favicon is .ico format (jsPDF supports it)
      logoX,
      logoY,
      logoWidth,
      logoHeight
    );
  } catch (err) {
    console.warn('Failed to load logo:', err);
    // Fallback: draw simple circle + D if logo fails
    doc.setFillColor(255, 255, 255);
    doc.circle(30, 30, 15, 'F');
    doc.setFillColor(0, 82, 204);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('D', 25, 36);
  }

  // 3. Main title - moved right to make space for logo
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DOIT Dashboard Report', 62, 30); // ← adjusted from 55 to 62
};
 
const addPDFFooter = (doc, page, total) => {
  const height = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Page ${page} of ${total}`, 14, height - 10);
};
 
const addSectionHeader = (doc, title, y) => {
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor(240, 245, 255);
  doc.rect(14, y - 8, width - 28, 12, 'F');
 
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 82, 204);
  doc.text(title, 18, y);
 
  return y + 15;
};
 
const addProgressBar = (doc, label, value, max, y, color) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const barWidth = pageWidth - 60;
  const percent = max > 0 ? value / max : 0;
 
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(label, 20, y);
  doc.text(`${value}/${max}`, pageWidth - 30, y, { align: 'right' });
 
  doc.setFillColor(229, 231, 235);
  doc.rect(20, y + 4, barWidth, 6, 'F');
 
  if (percent > 0) {
    doc.setFillColor(...color);
    doc.rect(20, y + 4, barWidth * percent, 6, 'F');
  }
 
  return y + 15;
};
 
const drawStyledTable = (doc, headers, rows, y) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const colWidth = (pageWidth - 28) / headers.length;
 
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  headers.forEach((h, i) => doc.text(h, 18 + i * colWidth, y));
  y += 8;
 
  doc.setFont('helvetica', 'normal');
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      doc.text(String(cell), 18 + i * colWidth, y);
    });
    y += 8;
  });
 
  return y + 5;
};
 
const addMetricsSummary = (doc, stats, y) => {
  doc.setFontSize(12);
  doc.setTextColor(40);
 
  doc.text(`Total Tasks: ${stats?.total || 0}`, 20, y);
  doc.text(`Completed: ${stats?.closed || 0}`, 20, y + 8);
  doc.text(`In Progress: ${stats?.in_progress || 0}`, 20, y + 16);
  doc.text(`Pending: ${stats?.pending || 0}`, 20, y + 24);
 
  return y + 35;
};

// Full chart functions from initial

/**
 * Generate chart as image using pure Canvas API
 */
const generateChartImage = (type, labels, datasets, options = {}) => {
  const canvas = document.createElement('canvas');
  canvas.width = options.width || 600;
  canvas.height = options.height || 400;
  const ctx = canvas.getContext('2d');
  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Title
  if (options.title) {
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(options.title, canvas.width / 2, 30);
  }
  const chartArea = {
    x: 60,
    y: options.title ? 60 : 40,
    width: canvas.width - 160,
    height: canvas.height - (options.title ? 120 : 100)
  };
  if (type === 'pie' || type === 'doughnut') {
    drawPieChart(ctx, canvas.width / 2 - 80, chartArea.y + chartArea.height / 2, Math.min(chartArea.width, chartArea.height) / 2 - 20, labels, datasets[0].data, datasets[0].backgroundColor, type === 'doughnut');
    drawLegend(ctx, canvas.width - 140, chartArea.y + 20, labels, datasets[0].backgroundColor, datasets[0].data);
  } else if (type === 'bar') {
    if (options.indexAxis === 'y') {
      drawHorizontalBarChart(ctx, chartArea, labels, datasets, options.scales?.x?.stacked);
    } else {
      drawVerticalBarChart(ctx, chartArea, labels, datasets, options.scales?.x?.stacked);
    }
  } else if (type === 'line') {
    drawLineChart(ctx, chartArea, labels, datasets);
  }
  return canvas.toDataURL('image/png');
};

/**
 * Draw Pie/Donut Chart
 */
const drawPieChart = (ctx, centerX, centerY, radius, labels, data, colors, isDonut = false) => {
  const total = data.reduce((sum, val) => sum + val, 0);
  if (total === 0) return;
  let startAngle = -Math.PI / 2;
  const innerRadius = isDonut ? radius * 0.5 : 0;
  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    // Draw slice
    ctx.fillStyle = colors[index];
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    if (isDonut) {
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    } else {
      ctx.lineTo(centerX, centerY);
    }
    ctx.closePath();
    ctx.fill();
    // White border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Percentage label
    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = isDonut ? (radius + innerRadius) / 2 : radius * 0.7;
    const labelX = centerX + Math.cos(midAngle) * labelRadius;
    const labelY = centerY + Math.sin(midAngle) * labelRadius;
    const percentage = ((value / total) * 100).toFixed(0);
    if (percentage > 5) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(percentage + '%', labelX, labelY);
    }
    startAngle = endAngle;
  });
  // Center text for donut
  if (isDonut) {
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 5);
    ctx.font = '12px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Total', centerX, centerY + 15);
  }
};

/**
 * Draw Legend
 */
const drawLegend = (ctx, x, y, labels, colors, data) => {
  const total = data.reduce((sum, val) => sum + val, 0);

  labels.forEach((label, i) => {
    const itemY = y + i * 30;
   
    // Color box
    ctx.fillStyle = colors[i];
    ctx.fillRect(x, itemY, 15, 15);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, itemY, 15, 15);
    // Label
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 20, itemY + 11);
   
    // Value
    const percentage = total > 0 ? ((data[i] / total) * 100).toFixed(0) : 0;
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${data[i]} (${percentage}%)`, x + 20, itemY + 23);
  });
};

/**
 * Draw Horizontal Bar Chart
 */
const drawHorizontalBarChart = (ctx, area, labels, datasets, stacked = false) => {
  const barHeight = 30;
  const spacing = 15;
  const maxValue = stacked 
    ? Math.max(...labels.map((_, i) => datasets.reduce((sum, ds) => sum + (ds.data[i] || 0), 0)))
    : Math.max(...datasets.flatMap(ds => ds.data));
  labels.forEach((label, i) => {
    const y = area.y + i * (barHeight + spacing);
   
    // Label
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(label.length > 20 ? label.substring(0, 17) + '...' : label, area.x - 10, y + barHeight / 2 + 4);
    let xOffset = area.x;
    datasets.forEach(dataset => {
      const value = dataset.data[i] || 0;
      const barWidth = (value / maxValue) * area.width;
      // Draw bar
      ctx.fillStyle = dataset.backgroundColor;
      ctx.fillRect(xOffset, y, barWidth, barHeight);
     
      // Value text
      if (barWidth > 30) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(value.toString(), xOffset + 5, y + barHeight / 2 + 4);
      }
      if (stacked) {
        xOffset += barWidth;
      }
    });
  });
  // Draw legend if multiple datasets
  if (datasets.length > 1) {
    let legendX = area.x;
    datasets.forEach(dataset => {
      ctx.fillStyle = dataset.backgroundColor;
      ctx.fillRect(legendX, area.y + area.height + 20, 15, 15);
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(dataset.label, legendX + 20, area.y + area.height + 31);
      legendX += ctx.measureText(dataset.label).width + 50;
    });
  }
};

/**
 * Draw Vertical Bar Chart
 */
const drawVerticalBarChart = (ctx, area, labels, datasets) => {
  const barWidth = (area.width / labels.length) - 10;
  const maxValue = Math.max(...datasets.flatMap(ds => ds.data));
  labels.forEach((label, i) => {
    const x = area.x + i * (area.width / labels.length);
   
    datasets.forEach((dataset, dsIndex) => {
      const value = dataset.data[i] || 0;
      const barHeight = (value / maxValue) * area.height;
      const barX = x + dsIndex * (barWidth / datasets.length);
      const barY = area.y + area.height - barHeight;
      // Draw bar
      ctx.fillStyle = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : dataset.backgroundColor;
      ctx.fillRect(barX, barY, barWidth / datasets.length, barHeight);
      // Value on top
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value + (dataset.label === 'Completion %' ? '%' : ''), barX + (barWidth / datasets.length) / 2, barY - 5);
    });
    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(x + barWidth / 2, area.y + area.height + 15);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText(label.length > 15 ? label.substring(0, 12) + '...' : label, 0, 0);
    ctx.restore();
  });
};

/**
 * Draw Line Chart
 */
const drawLineChart = (ctx, area, labels, datasets) => {
  const maxValue = Math.max(...datasets.flatMap(ds => ds.data));
  const stepX = area.width / (labels.length - 1);
  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = area.y + (area.height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(area.x, y);
    ctx.lineTo(area.x + area.width, y);
    ctx.stroke();
  }
  datasets.forEach(dataset => {
    // Draw line
    ctx.strokeStyle = dataset.borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    dataset.data.forEach((value, i) => {
      const x = area.x + i * stepX;
      const y = area.y + area.height - (value / maxValue) * area.height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    // Draw points
    dataset.data.forEach((value, i) => {
      const x = area.x + i * stepX;
      const y = area.y + area.height - (value / maxValue) * area.height;
      ctx.fillStyle = dataset.borderColor;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    // Draw fill
    if (dataset.fill) {
      ctx.fillStyle = dataset.backgroundColor;
      ctx.beginPath();
      dataset.data.forEach((value, i) => {
        const x = area.x + i * stepX;
        const y = area.y + area.height - (value / maxValue) * area.height;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.lineTo(area.x + area.width, area.y + area.height);
      ctx.lineTo(area.x, area.y + area.height);
      ctx.closePath();
      ctx.fill();
    }
  });
  // X-axis labels
  labels.forEach((label, i) => {
    const x = area.x + i * stepX;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, area.y + area.height + 20);
  });
};

// PDF Helpers...

// (keep all the PDF helpers as is)

// Main exportToPDF fixed

export const exportToPDF = async (analytics, userName) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ── PAGE 1 ── Cover + Overview ───────────────────────────────────────
    addPDFHeader(doc);
    let y = 80;

    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text(`Generated for: ${userName}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    doc.setFontSize(12);
    doc.text(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      pageWidth / 2,
      y,
      { align: 'center' }
    );
    y += 25;

    // Task Statistics Summary (removed "Completed" field)
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Total Tasks: ${analytics?.task_stats?.total || 0}`, 20, y);
    doc.text(`In Progress: ${analytics?.task_stats?.in_progress || 0}`, 20, y + 8);
    doc.text(`Pending: ${analytics?.task_stats?.pending || 0}`, 20, y + 16);
    doc.text(`Overdue: ${analytics?.task_stats?.overdue || 0}`, 20, y + 24);
    y += 45;

    y = addSectionHeader(doc, 'Task Progress Overview', y);
    y = addProgressBar(doc, 'In Progress', analytics.task_stats?.in_progress || 0, analytics.task_stats?.total || 0, y, [59, 130, 246]);
    y = addProgressBar(doc, 'Pending', analytics.task_stats?.pending || 0, analytics.task_stats?.total || 0, y, [245, 158, 11]);
    y = addProgressBar(doc, 'Overdue', analytics.task_stats?.overdue || 0, analytics.task_stats?.total || 0, y, [239, 68, 68]);

    // Status distribution table
    if (analytics.status_distribution) {
      y += 10;
      y = addSectionHeader(doc, 'Status Distribution', y);

      const statusData = Object.entries(analytics.status_distribution).map(([status, count]) => {
        const percentage = analytics.task_stats?.total > 0 ? `${((count / analytics.task_stats.total) * 100).toFixed(1)}%` : '0%';
        return [status, count, percentage];
      });

      y = drawStyledTable(doc, ['Status', 'Count', 'Percentage'], statusData, y);
    }

    // ── PAGE 2 ── Task Status Pie Chart ─────────────────────────────────
    doc.addPage();
    addPDFHeader(doc);
    y = 75;
    
    if (analytics.status_distribution) {
      y = addSectionHeader(doc, 'Task Status Distribution Chart', y);
      const statusColors = {
        'To Do': '#94a3b8',
        'In Progress': '#3b82f6',
        'Testing': '#f59e0b',
        'Dev Complete': '#8b5cf6',
        'Done': '#10b981',
        'Closed': '#6366f1'
      };
      const statusEntries = Object.entries(analytics.status_distribution).filter(([, value]) => value > 0);
      const chartImg = generateChartImage(
        'pie',
        statusEntries.map(([name]) => name),
        [{
          data: statusEntries.map(([, value]) => value),
          backgroundColor: statusEntries.map(([name]) => statusColors[name] || '#94a3b8')
        }],
        { title: 'Task Status Distribution', width: 500, height: 280 }
      );
      doc.addImage(chartImg, 'PNG', 15, y, 180, 100);
      y += 110;
    }

    // Task Priority Pie Chart on same page
    if (analytics.priority_distribution) {
      y = addSectionHeader(doc, 'Task Priority Distribution Chart', y);
      const priorityColors = {
        'High': '#ef4444',
        'Medium': '#f59e0b',
        'Low': '#94a3b8'
      };
      const priorityEntries = Object.entries(analytics.priority_distribution).filter(([, value]) => value > 0);
      const priorityChartImg = generateChartImage(
        'pie',
        priorityEntries.map(([name]) => name),
        [{
          data: priorityEntries.map(([, value]) => value),
          backgroundColor: priorityEntries.map(([name]) => priorityColors[name] || '#94a3b8')
        }],
        { title: 'Task Priority Distribution', width: 500, height: 280 }
      );
      doc.addImage(priorityChartImg, 'PNG', 15, y, 180, 100);
    }

    // ── PAGE 3 ── Project Progress Bar Chart ───────────────────────────────
    if (analytics.project_progress?.length > 0) {
      doc.addPage();
      addPDFHeader(doc);
      y = 75;

      y = addSectionHeader(doc, 'Project Progress Overview', y);
      
      // Generate bar chart
      const projectNames = analytics.project_progress.map(p => p.project_name || 'Unknown');
      const completedTasks = analytics.project_progress.map(p => p.completed_tasks || 0);
      const totalTasks = analytics.project_progress.map(p => p.total_tasks || 0);
      
      const barChartImg = generateChartImage(
        'bar',
        projectNames,
        [
          {
            label: 'Completed',
            data: completedTasks,
            backgroundColor: '#10b981'
          },
          {
            label: 'Total',
            data: totalTasks,
            backgroundColor: '#94a3b8'
          }
        ],
        { 
          title: 'Project Progress: Total vs Completed Tasks', 
          width: 600, 
          height: 350,
          indexAxis: 'x'
        }
      );
      doc.addImage(barChartImg, 'PNG', 10, y, 190, 110);
      y += 125;

      // Project statistics table
      y = addSectionHeader(doc, 'Project Statistics Details', y);
      const projectData = analytics.project_progress.slice(0, 10).map(project => [
        project.project_name || 'Unknown',
        project.total_tasks || 0,
        project.completed_tasks || 0,
        `${project.progress_percentage || 0}%`
      ]);
      y = drawStyledTable(doc, ['Project', 'Total', 'Completed', 'Progress'], projectData, y);
    }

    // ── PAGE 4 ── Upcoming Deadlines ───────────────────────────────────
    if (analytics.upcoming_deadlines?.length > 0) {
      doc.addPage();
      addPDFHeader(doc);
      y = 75;

      y = addSectionHeader(doc, 'Upcoming Deadlines', y);

      const deadlineData = analytics.upcoming_deadlines.slice(0, 15).map(task => {
        const dueDate = new Date(task.due_date);
        const daysText = task.days_until < 0 ? `Overdue ${Math.abs(task.days_until)}d` : `${task.days_until}d`;
        return [
          task.title.substring(0, 30),
          task.project_name.substring(0, 20),
          dueDate.toLocaleDateString(),
          daysText
        ];
      });

      y = drawStyledTable(doc, ['Task', 'Project', 'Due Date', 'Days'], deadlineData, y);
    }

    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addPDFFooter(doc, i, totalPages);
    }

    // Save the PDF
    doc.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};

// Keep exportToExcel and exportToCSV as is

// Add the generateCanvasReport from initial

/**
 * Generate Canvas-based Visual Report
 * This creates an interactive visual report that can be displayed in a modal
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on
 * @param {Object} analytics - Analytics data
 * @param {string} userName - User's name
 * @param {number} pageNumber - Page to render (1-4)
 */
export const generateCanvasReport = (canvas, analytics, userName, pageNumber = 1) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  // Helper: Rounded Rectangle
  const roundRect = (x, y, w, h, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };
  // Add Header
  const addCanvasHeader = () => {
    const gradient = ctx.createLinearGradient(0, 0, width, 80);
    gradient.addColorStop(0, '#0052cc');
    gradient.addColorStop(1, '#0747a6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('DOIT Dashboard Report', 30, 45);
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Comprehensive Analytics & Insights', 30, 65);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 75);
    ctx.lineTo(width - 20, 75);
    ctx.stroke();
  };
  // Add Footer
  const addCanvasFooter = (pageNum, totalPages = 4) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, height - 40, width, 40);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Arial, sans-serif';
    
    ctx.fillText(`Page ${pageNum} of ${totalPages}`, 20, height - 18);
    
    const centerText = 'Generated by DOIT Task Management System';
    const centerTextWidth = ctx.measureText(centerText).width;
    ctx.fillText(centerText, (width - centerTextWidth) / 2, height - 18);
    
    const dateText = new Date().toLocaleDateString();
    const dateWidth = ctx.measureText(dateText).width;
    ctx.fillText(dateText, width - dateWidth - 20, height - 18);
  };
  // Section Header
  const drawCanvasSectionHeader = (title, y) => {
    ctx.fillStyle = '#f0f5ff';
    roundRect(30, y - 8, width - 60, 30, 5);
    ctx.fill();
    ctx.fillStyle = '#0052cc';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(title, 45, y + 12);
    return y + 35;
  };
  // Progress Bar
  const drawCanvasProgressBar = (label, value, max, y, color) => {
    const barWidth = 720;
    ctx.fillStyle = '#475569';
    ctx.font = '13px Arial, sans-serif';
    ctx.fillText(label, 40, y);
    ctx.fillText(`${value}/${max}`, 40 + barWidth - 50, y);
    ctx.fillStyle = '#e5e7eb';
    roundRect(40, y + 5, barWidth, 20, 10);
    ctx.fill();
    const percentage = max > 0 ? (value / max) : 0;
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    roundRect(40, y + 5, barWidth * percentage, 20, 10);
    ctx.fill();
    return y + 40;
  };
  // Mini Pie Chart
  const drawMiniPieChart = (x, y, radius) => {
    const total = analytics.task_stats?.total || 1;
    const completed = analytics.task_stats?.closed || 0;
    const inProgress = analytics.task_stats?.in_progress || 0;
    const pending = analytics.task_stats?.pending || 0;
    const completedAngle = (completed / total) * 2 * Math.PI;
    const inProgressAngle = (inProgress / total) * 2 * Math.PI;
    const pendingAngle = (pending / total) * 2 * Math.PI;
    let startAngle = 0;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, startAngle + completedAngle);
    ctx.closePath();
    ctx.fill();
    startAngle += completedAngle;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, startAngle + inProgressAngle);
    ctx.closePath();
    ctx.fill();
    startAngle += inProgressAngle;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, startAngle + pendingAngle);
    ctx.closePath();
    ctx.fill();
  };
  // Page 1: Cover Page
  const renderCoverPage = () => {
    addCanvasHeader();
    let y = 120;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial, sans-serif';
    const userText = `Generated for: ${userName}`;
    ctx.fillText(userText, width / 2 - ctx.measureText(userText).width / 2, y);
    y += 40;
    ctx.font = '16px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillText(dateStr, width / 2 - ctx.measureText(dateStr).width / 2, y);
    y += 25;
    // Metrics Box
    const colWidth = (width - 80) / 2;
    ctx.fillStyle = '#f0f5ff';
    roundRect(40, y, colWidth - 10, 200, 10);
    ctx.fill();
    ctx.fillStyle = '#0052cc';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Task Overview', 60, y + 30);
    ctx.fillStyle = '#475569';
    ctx.font = '14px Arial, sans-serif';
    const taskMetrics = [
      `Total: ${analytics.task_stats?.total || 0}`,
      `Pending: ${analytics.task_stats?.pending || 0}`,
      `In Progress: ${analytics.task_stats?.in_progress || 0}`,
      `Completed: ${analytics.task_stats?.closed || 0}`,
      `Overdue: ${analytics.task_stats?.overdue || 0}`
    ];
    taskMetrics.forEach((metric, i) => {
      ctx.fillText(metric, 60, y + 60 + i * 25);
    });
    ctx.fillStyle = '#f0f5ff';
    roundRect(50 + colWidth, y, colWidth - 10, 200, 10);
    ctx.fill();
    ctx.fillStyle = '#0052cc';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Performance', 70 + colWidth, y + 30);
    const completionRate = analytics.task_stats?.total > 0
      ? ((analytics.task_stats.closed / analytics.task_stats.total) * 100).toFixed(1)
      : 0;
    const onTimeRate = analytics.task_stats?.total > 0
      ? (((analytics.task_stats.total - (analytics.task_stats.overdue || 0)) / analytics.task_stats.total) * 100).toFixed(1)
      : 0;
    ctx.fillStyle = '#475569';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(`Completion: ${completionRate}%`, 70 + colWidth, y + 60);
    ctx.fillText(`On-Time: ${onTimeRate}%`, 70 + colWidth, y + 85);
    ctx.fillText(`Overdue: ${analytics.task_stats?.overdue || 0}`, 70 + colWidth, y + 110);
    drawMiniPieChart(70 + colWidth, y + 150, 50);
    y += 250;
    y = drawCanvasSectionHeader('Task Progress Overview', y);
    y = drawCanvasProgressBar('Completed Tasks', analytics.task_stats?.closed || 0, analytics.task_stats?.total || 0, y, [16, 185, 129]);
    y = drawCanvasProgressBar('In Progress Tasks', analytics.task_stats?.in_progress || 0, analytics.task_stats?.total || 0, y, [59, 130, 246]);
    drawCanvasProgressBar('Pending Tasks', analytics.task_stats?.pending || 0, analytics.task_stats?.total || 0, y, [245, 158, 11]);
    addCanvasFooter(1);
  };
  // Page 2: Task Statistics
  const renderTaskStatistics = () => {
    addCanvasHeader();
    let y = 110;
    y = drawCanvasSectionHeader('Task Statistics', y);
    y += 5;
    if (analytics.status_distribution) {
      const entries = Object.entries(analytics.status_distribution);
      const maxValue = Math.max(...entries.map(([, count]) => count));
      const barWidth = (width - 120) / entries.length - 20;
      const chartHeight = 250;
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
      entries.forEach(([status, count], i) => {
        const barH = (count / maxValue) * (chartHeight - 50);
        const barX = 40 + i * (barWidth + 20);
        const barY = y + chartHeight - barH - 30;
        const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barH);
        gradient.addColorStop(0, colors[i % colors.length]);
        gradient.addColorStop(1, colors[i % colors.length] + 'cc');
        ctx.fillStyle = gradient;
        roundRect(barX, barY, barWidth, barH, 5);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Arial, sans-serif';
        const valueText = count.toString();
        const valueWidth = ctx.measureText(valueText).width;
        ctx.fillText(valueText, barX + (barWidth - valueWidth) / 2, barY - 10);
        ctx.font = '12px Arial, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.save();
        ctx.translate(barX + barWidth / 2, y + chartHeight - 10);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(status, 0, 0);
        ctx.restore();
      });
      y += 280;
    }
    y = drawCanvasSectionHeader('Priority Distribution', y);
    y += 5;
    const rowHeight = 35;
    const tableWidth = width - 80;
    const colWidths = [tableWidth * 0.5, tableWidth * 0.25, tableWidth * 0.25];
    ctx.fillStyle = '#0052cc';
    roundRect(40, y, tableWidth, rowHeight, 5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('Priority', 55, y + 22);
    ctx.fillText('Count', 55 + colWidths[0], y + 22);
    ctx.fillText('Percentage', 55 + colWidths[0] + colWidths[1], y + 22);
    const priorities = ['High', 'Medium', 'Low'];
    const rowColors = ['#fee2e2', '#fef3c7', '#dbeafe'];
    priorities.forEach((priority, i) => {
      const rowY = y + (i + 1) * rowHeight;
      const count = analytics.priority_distribution?.[priority] || 0;
      const total = analytics.task_stats?.total || 1;
      const percentage = ((count / total) * 100).toFixed(1);
      ctx.fillStyle = rowColors[i];
      ctx.fillRect(40, rowY, tableWidth, rowHeight);
      ctx.fillStyle = '#1e293b';
      ctx.font = '13px Arial, sans-serif';
      ctx.fillText(priority, 55, rowY + 22);
      ctx.fillText(count.toString(), 55 + colWidths[0], rowY + 22);
      ctx.fillText(`${percentage}%`, 55 + colWidths[0] + colWidths[1], rowY + 22);
    });
    addCanvasFooter(2);
  };
  // Page 3: Project Progress
  const renderProjectProgress = () => {
    addCanvasHeader();
    let y = 110;
    y = drawCanvasSectionHeader('Project Progress', y);
    y += 15;
    if (analytics.project_progress && analytics.project_progress.length > 0) {
      analytics.project_progress.slice(0, 5).forEach((project) => {
        const cardWidth = width - 80;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        roundRect(40, y, cardWidth, 70, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 15px Arial, sans-serif';
        const projectName = project.project_name.length > 40 
          ? project.project_name.substring(0, 40) + '...' 
          : project.project_name;
        ctx.fillText(projectName, 55, y + 25);
        ctx.font = '12px Arial, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Tasks: ${project.total_tasks || 0}`, 55, y + 45);
        ctx.fillText(`Completed: ${project.completed_tasks || 0}`, 160, y + 45);
        const progress = project.progress_percentage || 0;
        const progressBarWidth = cardWidth - 180;
        const progressX = 40 + cardWidth - progressBarWidth - 15;
        ctx.fillStyle = '#e5e7eb';
        roundRect(progressX, y + 52, progressBarWidth, 12, 6);
        ctx.fill();
        const progressColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#ef4444';
        ctx.fillStyle = progressColor;
        roundRect(progressX, y + 52, (progressBarWidth * progress) / 100, 12, 6);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px Arial, sans-serif';
        ctx.fillText(`${progress}%`, progressX + progressBarWidth + 10, y + 62);
        y += 90;
      });
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('No project data available', 40, y);
    }
    addCanvasFooter(3);
  };
  // Page 4: Deadlines
  const renderDeadlines = () => {
    addCanvasHeader();
    let y = 110;
    y = drawCanvasSectionHeader('Upcoming Deadlines', y);
    y += 15;
    if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
      analytics.upcoming_deadlines.slice(0, 6).forEach((task, i) => {
        const isOverdue = task.days_until < 0;
        const cardWidth = width - 80;
        ctx.fillStyle = isOverdue ? '#fef2f2' : '#f0f9ff';
        ctx.strokeStyle = isOverdue ? '#fecaca' : '#bae6fd';
        ctx.lineWidth = 2;
        roundRect(40, y, cardWidth, 55, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0052cc';
        roundRect(52, y + 12, 70, 20, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial, sans-serif';
        ctx.fillText(task.ticket_id || `T-${i + 1}`, 60, y + 25);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Arial, sans-serif';
        const title = task.title.length > 50 ? task.title.substring(0, 50) + '...' : task.title;
        ctx.fillText(title, 135, y + 25);
        ctx.font = '11px Arial, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Priority: ${task.priority}`, 52, y + 42);
        ctx.fillText(`Project: ${task.project_name || 'N/A'}`, 160, y + 42);
        const dueDate = new Date(task.due_date).toLocaleDateString();
        const daysText = isOverdue
          ? `${Math.abs(task.days_until)} days overdue`
          : `${task.days_until} days left`;
        ctx.fillStyle = isOverdue ? '#ef4444' : '#10b981';
        ctx.font = 'bold 12px Arial, sans-serif';
        ctx.fillText(`Due: ${dueDate} (${daysText})`, 40 + cardWidth - 220, y + 42);
        y += 70;
      });
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('No upcoming deadlines', 40, y);
    }
    addCanvasFooter(4);
  };
  // Render the appropriate page
  switch (pageNumber) {
    case 1:
      renderCoverPage();
      break;
    case 2:
      renderTaskStatistics();
      break;
    case 3:
      renderProjectProgress();
      break;
    case 4:
      renderDeadlines();
      break;
    default:
      renderCoverPage();
  }
  return canvas;
};

// Keep exportToExcel and exportToCSV

export const exportToExcel = (analytics, report, userName) => {
  try {
    const wb = XLSX.utils.book_new();
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // ==================== EXECUTIVE SUMMARY ====================
    const summaryData = [
      ['DOIT Dashboard Report - Executive Summary'],
      [`Generated for: ${userName}`],
      [`Date: ${currentDate}`],
      [],
      ['KEY PERFORMANCE INDICATORS'],
      ['Metric', 'Value', 'Status'],
      [
        'Completion Rate', 
        analytics.task_stats?.total > 0 
          ? `${((analytics.task_stats.closed / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%',
        analytics.task_stats?.total > 0 && (analytics.task_stats.closed / analytics.task_stats.total) >= 0.7 
          ? 'Good' 
          : 'Needs Improvement'
      ],
      [
        'On-Time Delivery',
        analytics.task_stats?.total > 0
          ? `${(((analytics.task_stats.total - (analytics.task_stats.overdue || 0)) / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%',
        (analytics.task_stats?.overdue || 0) === 0 ? 'Excellent' : 'Review Required'
      ],
      [
        'Active Tasks',
        (analytics.task_stats?.pending || 0) + (analytics.task_stats?.in_progress || 0),
        'In Progress'
      ],
      [],
      ['TASK STATISTICS'],
      ['Metric', 'Count', 'Percentage'],
      [
        'Total Tasks', 
        analytics.task_stats?.total || 0,
        '100%'
      ],
      [
        'Pending Tasks', 
        analytics.task_stats?.pending || 0,
        analytics.task_stats?.total > 0 
          ? `${((analytics.task_stats.pending / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%'
      ],
      [
        'In Progress', 
        analytics.task_stats?.in_progress || 0,
        analytics.task_stats?.total > 0 
          ? `${((analytics.task_stats.in_progress / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%'
      ],
      [
        'Completed Tasks', 
        analytics.task_stats?.closed || 0,
        analytics.task_stats?.total > 0 
          ? `${((analytics.task_stats.closed / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%'
      ],
      [
        'Overdue Tasks', 
        analytics.task_stats?.overdue || 0,
        analytics.task_stats?.total > 0 
          ? `${((analytics.task_stats.overdue / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%'
      ],
      [],
      ['PROJECT STATISTICS'],
      ['Metric', 'Count'],
      ['Total Projects', analytics.project_stats?.total || 0],
      ['Owned Projects', analytics.project_stats?.owned || 0],
      ['Member Projects', analytics.project_stats?.member_of || 0],
      ['Active Projects', analytics.project_stats?.active || 0],
      [],
      ['PRIORITY DISTRIBUTION'],
      ['Priority', 'Count', 'Percentage'],
      [
        'High',
        analytics.priority_distribution?.High || 0,
        analytics.task_stats?.total > 0
          ? `${(((analytics.priority_distribution?.High || 0) / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%'
      ],
      [
        'Medium',
        analytics.priority_distribution?.Medium || 0,
        analytics.task_stats?.total > 0
          ? `${(((analytics.priority_distribution?.Medium || 0) / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%'
      ],
      [
        'Low',
        analytics.priority_distribution?.Low || 0,
        analytics.task_stats?.total > 0
          ? `${(((analytics.priority_distribution?.Low || 0) / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%'
      ]
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 20 }];
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Executive Summary');
    
    // ==================== STATUS BREAKDOWN ====================
    if (analytics.status_distribution) {
      const statusData = [
        ['Task Status Analysis'],
        [`Report Date: ${currentDate}`],
        [],
        ['Status', 'Count', 'Percentage', 'Trend']
      ];
      
      const total = Object.values(analytics.status_distribution).reduce((sum, count) => sum + count, 0);
      
      Object.entries(analytics.status_distribution).forEach(([status, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%';
        const trend = status === 'Done' || status === 'Closed' ? '✓ Complete' : '→ Active';
        statusData.push([status, count, percentage, trend]);
      });
      
      statusData.push([]);
      statusData.push(['Total Tasks', total, '100%', '']);
      
      const ws2 = XLSX.utils.aoa_to_sheet(statusData);
      ws2['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
      
      XLSX.utils.book_append_sheet(wb, ws2, 'Status Analysis');
    }
    
    // ==================== UPCOMING DEADLINES ====================
    if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
      const deadlineData = [
        ['Upcoming Deadlines & Due Tasks'],
        [`Total Tasks with Deadlines: ${analytics.upcoming_deadlines.length}`],
        [],
        ['Ticket ID', 'Task Title', 'Priority', 'Status', 'Due Date', 'Days Until', 'Project', 'Urgency']
      ];
      
      analytics.upcoming_deadlines.forEach(task => {
        const daysUntil = task.days_until;
        let urgency = 'Low';
        if (daysUntil < 0) urgency = 'OVERDUE';
        else if (daysUntil <= 3) urgency = 'Critical';
        else if (daysUntil <= 7) urgency = 'High';
        else if (daysUntil <= 14) urgency = 'Medium';
        
        deadlineData.push([
          task.ticket_id || 'N/A',
          task.title || 'Untitled',
          task.priority || 'Medium',
          task.status || 'To Do',
          task.due_date ? new Date(task.due_date).toLocaleDateString('en-US') : 'No deadline',
          daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`,
          task.project_name || 'N/A',
          urgency
        ]);
      });
      
      const ws3 = XLSX.utils.aoa_to_sheet(deadlineData);
      ws3['!cols'] = [
        { wch: 12 }, 
        { wch: 40 }, 
        { wch: 12 }, 
        { wch: 15 }, 
        { wch: 15 }, 
        { wch: 18 }, 
        { wch: 25 },
        { wch: 12 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws3, 'Deadlines');
    }
    
    // ==================== PROJECT PROGRESS ====================
    if (analytics.project_progress && analytics.project_progress.length > 0) {
      const projectData = [
        ['Project Progress Dashboard'],
        [`Total Projects: ${analytics.project_progress.length}`],
        [],
        ['Project Name', 'Total Tasks', 'Completed', 'In Progress', 'Pending', 'Progress %', 'Health Status']
      ];
      
      analytics.project_progress.forEach(proj => {
        const progress = proj.progress_percentage || 0;
        let health = 'On Track';
        if (progress >= 80) health = 'Excellent';
        else if (progress >= 60) health = 'Good';
        else if (progress >= 40) health = 'At Risk';
        else health = 'Needs Attention';
        
        projectData.push([
          proj.project_name || 'Unnamed Project',
          proj.total_tasks || 0,
          proj.completed_tasks || 0,
          proj.in_progress_tasks || 0,
          proj.pending_tasks || 0,
          progress + '%',
          health
        ]);
      });
      
      const ws4 = XLSX.utils.aoa_to_sheet(projectData);
      ws4['!cols'] = [
        { wch: 30 }, 
        { wch: 13 }, 
        { wch: 13 }, 
        { wch: 13 }, 
        { wch: 13 }, 
        { wch: 13 },
        { wch: 18 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws4, 'Project Progress');
    }
    
    // ==================== MY TASKS DETAILED ====================
    if (report && report.my_tasks && report.my_tasks.length > 0) {
      const tasksData = [
        ['My Tasks - Detailed Report'],
        [`Total Assigned Tasks: ${report.my_tasks.length}`],
        [],
        ['Ticket ID', 'Title', 'Status', 'Priority', 'Due Date', 'Project', 'Assigned Date', 'Age (Days)']
      ];
      
      report.my_tasks.forEach(task => {
        const createdDate = task.created_at ? new Date(task.created_at) : new Date();
        const ageDays = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
        
        tasksData.push([
          task.ticket_id || 'N/A',
          task.title || 'Untitled',
          task.status || 'To Do',
          task.priority || 'Medium',
          task.due_date ? new Date(task.due_date).toLocaleDateString('en-US') : 'No deadline',
          task.project_name || 'N/A',
          task.created_at ? new Date(task.created_at).toLocaleDateString('en-US') : 'N/A',
          ageDays
        ]);
      });
      
      const ws5 = XLSX.utils.aoa_to_sheet(tasksData);
      ws5['!cols'] = [
        { wch: 12 }, 
        { wch: 40 }, 
        { wch: 15 }, 
        { wch: 12 }, 
        { wch: 15 }, 
        { wch: 25 }, 
        { wch: 15 },
        { wch: 12 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws5, 'My Tasks');
    }
    
    // ==================== RECENT ACTIVITY ====================
    if (analytics.recent_activities && analytics.recent_activities.length > 0) {
      const activityData = [
        ['Recent Activity Log'],
        [`Last ${analytics.recent_activities.length} Activities`],
        [],
        ['Task Title', 'Status', 'Priority', 'Project', 'Last Updated', 'Action Type']
      ];
      
      analytics.recent_activities.forEach(activity => {
        activityData.push([
          activity.title || 'Untitled',
          activity.status || 'N/A',
          activity.priority || 'Medium',
          activity.project_name || 'N/A',
          activity.updated_at ? new Date(activity.updated_at).toLocaleString('en-US') : 'N/A',
          activity.action_type || 'Update'
        ]);
      });
      
      const ws6 = XLSX.utils.aoa_to_sheet(activityData);
      ws6['!cols'] = [
        { wch: 40 }, 
        { wch: 15 }, 
        { wch: 12 }, 
        { wch: 25 }, 
        { wch: 20 },
        { wch: 15 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws6, 'Recent Activity');
    }
    
    // ==================== INSIGHTS & RECOMMENDATIONS ====================
    const insights = [
      ['Insights & Recommendations'],
      [],
      ['Category', 'Insight', 'Recommendation'],
    ];
    
    // Generate dynamic insights
    const completionRate = analytics.task_stats?.total > 0 
      ? (analytics.task_stats.closed / analytics.task_stats.total) * 100 
      : 0;
    
    if (completionRate < 50) {
      insights.push([
        'Task Completion',
        `Completion rate is ${completionRate.toFixed(1)}% (below target)`,
        'Focus on completing pending tasks. Consider reviewing task priorities.'
      ]);
    }
    
    if ((analytics.task_stats?.overdue || 0) > 0) {
      insights.push([
        'Overdue Tasks',
        `${analytics.task_stats.overdue} tasks are overdue`,
        'Prioritize overdue tasks immediately. Review deadlines and resource allocation.'
      ]);
    }
    
    const highPriorityTasks = analytics.priority_distribution?.High || 0;
    if (highPriorityTasks > (analytics.task_stats?.total || 0) * 0.3) {
      insights.push([
        'Priority Distribution',
        `${highPriorityTasks} high-priority tasks (>30% of total)`,
        'Review priority assignments. Consider if all high-priority tasks are truly critical.'
      ]);
    }
    
    if (analytics.project_stats?.total > 10) {
      insights.push([
        'Project Management',
        `Managing ${analytics.project_stats.total} projects`,
        'Consider consolidating projects or delegating ownership for better focus.'
      ]);
    }
    
    insights.push([
      'Performance',
      'Report generated successfully',
      'Regular monitoring recommended for optimal task management.'
    ]);
    
    const ws7 = XLSX.utils.aoa_to_sheet(insights);
    ws7['!cols'] = [{ wch: 20 }, { wch: 45 }, { wch: 50 }];
    
    XLSX.utils.book_append_sheet(wb, ws7, 'Insights');
    
    // Generate and download
    XLSX.writeFile(wb, `DOIT-Dashboard-Report-${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error('Failed to generate Excel: ' + error.message);
  }
};

/**
 * Enhanced CSV Export
 */
export const exportToCSV = (analytics, userName) => {
  try {
    let csv = 'DOIT Dashboard Report\n';
    csv += `Generated for: ${userName}\n`;
    csv += `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    csv += `Time: ${new Date().toLocaleTimeString('en-US')}\n\n`;
    
    // Key Performance Indicators
    csv += '=== KEY PERFORMANCE INDICATORS ===\n';
    csv += 'Metric,Value\n';
    const completionRate = analytics.task_stats?.total > 0 
      ? ((analytics.task_stats.closed / analytics.task_stats.total) * 100).toFixed(1)
      : 0;
    csv += `Completion Rate,${completionRate}%\n`;
    
    const onTimeRate = analytics.task_stats?.total > 0 
      ? (((analytics.task_stats.total - (analytics.task_stats.overdue || 0)) / analytics.task_stats.total) * 100).toFixed(1)
      : 0;
    csv += `On-Time Delivery Rate,${onTimeRate}%\n\n`;
    
    // Task Statistics
    csv += '=== TASK STATISTICS ===\n';
    csv += 'Metric,Count,Percentage\n';
    csv += `Total Tasks,${analytics.task_stats?.total || 0},100%\n`;
    csv += `Pending Tasks,${analytics.task_stats?.pending || 0},${analytics.task_stats?.total > 0 ? ((analytics.task_stats.pending / analytics.task_stats.total) * 100).toFixed(1) : 0}%\n`;
    csv += `In Progress,${analytics.task_stats?.in_progress || 0},${analytics.task_stats?.total > 0 ? ((analytics.task_stats.in_progress / analytics.task_stats.total) * 100).toFixed(1) : 0}%\n`;
    csv += `Completed Tasks,${analytics.task_stats?.closed || 0},${analytics.task_stats?.total > 0 ? ((analytics.task_stats.closed / analytics.task_stats.total) * 100).toFixed(1) : 0}%\n`;
    csv += `Overdue Tasks,${analytics.task_stats?.overdue || 0},${analytics.task_stats?.total > 0 ? ((analytics.task_stats.overdue / analytics.task_stats.total) * 100).toFixed(1) : 0}%\n\n`;
    
    // Project Statistics
    csv += '=== PROJECT STATISTICS ===\n';
    csv += 'Metric,Count\n';
    csv += `Total Projects,${analytics.project_stats?.total || 0}\n`;
    csv += `Owned Projects,${analytics.project_stats?.owned || 0}\n`;
    csv += `Member Of,${analytics.project_stats?.member_of || 0}\n`;
    csv += `Active Projects,${analytics.project_stats?.active || 0}\n\n`;
    
    // Priority Distribution
    csv += '=== PRIORITY DISTRIBUTION ===\n';
    csv += 'Priority,Count,Percentage\n';
    csv += `High,${analytics.priority_distribution?.High || 0},${analytics.task_stats?.total > 0 ? (((analytics.priority_distribution?.High || 0) / analytics.task_stats.total) * 100).toFixed(1) : 0}%\n`;
    csv += `Medium,${analytics.priority_distribution?.Medium || 0},${analytics.task_stats?.total > 0 ? (((analytics.priority_distribution?.Medium || 0) / analytics.task_stats.total) * 100).toFixed(1) : 0}%\n`;
    csv += `Low,${analytics.priority_distribution?.Low || 0},${analytics.task_stats?.total > 0 ? (((analytics.priority_distribution?.Low || 0) / analytics.task_stats.total) * 100).toFixed(1) : 0}%\n\n`;
    
    // Status Distribution
    if (analytics.status_distribution) {
      csv += '=== STATUS DISTRIBUTION ===\n';
      csv += 'Status,Count,Percentage\n';
      const total = Object.values(analytics.status_distribution).reduce((sum, count) => sum + count, 0);
      Object.entries(analytics.status_distribution).forEach(([status, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        csv += `${status},${count},${percentage}%\n`;
      });
      csv += '\n';
    }
    
    // Upcoming Deadlines
    if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
      csv += '=== UPCOMING DEADLINES ===\n';
      csv += 'Ticket ID,Task,Priority,Status,Due Date,Days Until,Project,Urgency\n';
      analytics.upcoming_deadlines.forEach(task => {
        const daysUntil = task.days_until;
        let urgency = 'Low';
        if (daysUntil < 0) urgency = 'OVERDUE';
        else if (daysUntil <= 3) urgency = 'Critical';
        else if (daysUntil <= 7) urgency = 'High';
        else if (daysUntil <= 14) urgency = 'Medium';
        
        const daysText = daysUntil < 0 
          ? `${Math.abs(daysUntil)} days overdue` 
          : `${daysUntil} days`;
        
        csv += `${task.ticket_id || 'N/A'},"${task.title}",${task.priority},${task.status},${new Date(task.due_date).toLocaleDateString()},${daysText},"${task.project_name}",${urgency}\n`;
      });
      csv += '\n';
    }
    
    // Project Progress
    if (analytics.project_progress && analytics.project_progress.length > 0) {
      csv += '=== PROJECT PROGRESS ===\n';
      csv += 'Project Name,Total Tasks,Completed,In Progress,Pending,Progress %,Health Status\n';
      analytics.project_progress.forEach(proj => {
        const progress = proj.progress_percentage || 0;
        let health = 'On Track';
        if (progress >= 80) health = 'Excellent';
        else if (progress >= 60) health = 'Good';
        else if (progress >= 40) health = 'At Risk';
        else health = 'Needs Attention';
        
        csv += `"${proj.project_name}",${proj.total_tasks || 0},${proj.completed_tasks || 0},${proj.in_progress_tasks || 0},${proj.pending_tasks || 0},${progress}%,${health}\n`;
      });
    }
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `DOIT-Dashboard-Report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw new Error('Failed to generate CSV: ' + error.message);
  }
}