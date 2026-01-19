import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
const addPDFHeader = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
 
  doc.setFillColor(0, 82, 204); // Jira blue
  doc.rect(0, 0, pageWidth, 60, 'F');

  // 2. Add your logo (favicon)
  const logoUrl = 'https://raw.githubusercontent.com/kchoudhary-parkar/task_management_system/refs/heads/main/frontend/src/doit.png'; // ← change to production URL later!
  
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
    
    // Helper function to create styled header row
    const createStyledHeader = (title, cols = 3) => {
      return [
        [title],
        [`Generated for: ${userName}`],
        [`Date: ${currentDate}`],
        []
      ];
    };
    
    // ==================== EXECUTIVE SUMMARY ====================
    const summaryData = createStyledHeader('DOIT Dashboard Report - Executive Summary', 3);
    
    summaryData.push(['KEY PERFORMANCE INDICATORS']);
    summaryData.push(['Metric', 'Value', 'Status']);
    
    const completionRate = analytics.task_stats?.total > 0 
      ? ((analytics.task_stats.closed / analytics.task_stats.total) * 100).toFixed(1)
      : '0.0';
    
    summaryData.push([
      'Completion Rate', 
      `${completionRate}%`,
      parseFloat(completionRate) >= 70 ? 'Good' : 'Needs Improvement'
    ]);
    
    const onTimeRate = analytics.task_stats?.total > 0
      ? (((analytics.task_stats.total - (analytics.task_stats.overdue || 0)) / analytics.task_stats.total) * 100).toFixed(1)
      : '100.0';
    
    summaryData.push([
      'On-Time Delivery',
      `${onTimeRate}%`,
      (analytics.task_stats?.overdue || 0) === 0 ? 'Excellent' : 'Review Required'
    ]);
    
    summaryData.push([
      'Active Tasks',
      (analytics.task_stats?.pending || 0) + (analytics.task_stats?.in_progress || 0),
      (analytics.task_stats?.pending || 0) + (analytics.task_stats?.in_progress || 0) + ' In Progress'
    ]);
    
    summaryData.push([]);
    summaryData.push(['TASK STATISTICS']);
    summaryData.push(['Metric', 'Count', 'Percentage']);
    
    const taskStats = [
      ['Total Tasks', analytics.task_stats?.total || 0, '100%'],
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
        'Overdue Tasks', 
        analytics.task_stats?.overdue || 0,
        analytics.task_stats?.total > 0 
          ? `${((analytics.task_stats.overdue / analytics.task_stats.total) * 100).toFixed(1)}%`
          : '0%'
      ]
    ];
    
    summaryData.push(...taskStats);
    summaryData.push([]);
    summaryData.push(['PROJECT STATISTICS']);
    summaryData.push(['Metric', 'Count']);
    summaryData.push(['Total Projects', analytics.project_stats?.total || 0]);
    summaryData.push(['Owned Projects', analytics.project_stats?.owned || 0]);
    summaryData.push(['Member Projects', analytics.project_stats?.member_of || 0]);
    
    summaryData.push([]);
    summaryData.push(['PRIORITY DISTRIBUTION']);
    summaryData.push(['Priority', 'Count', 'Percentage']);
    
    const priorities = ['High', 'Medium', 'Low'];
    priorities.forEach(priority => {
      const count = analytics.priority_distribution?.[priority] || 0;
      const percentage = analytics.task_stats?.total > 0
        ? `${((count / analytics.task_stats.total) * 100).toFixed(1)}%`
        : '0%';
      summaryData.push([priority, count, percentage]);
    });
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for better readability
    ws1['!cols'] = [
      { wch: 25 },  // Column A - Metric names
      { wch: 18 },  // Column B - Values
      { wch: 22 }   // Column C - Status/Percentage
    ];
    
    // Merge cells for title
    ws1['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }  // Merge title across 3 columns
    ];
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Executive Summary');
    
    // ==================== STATUS BREAKDOWN ====================
    if (analytics.status_distribution) {
      const statusData = createStyledHeader('Task Status Analysis');
      
      statusData.push(['Status', 'Count', 'Percentage', 'Trend']);
      
      const total = Object.values(analytics.status_distribution).reduce((sum, count) => sum + count, 0);
      
      // Order statuses logically: To Do → In Progress → Testing → Dev Complete → Done → Closed
      const statusOrder = ['To Do', 'In Progress', 'Testing', 'Dev Complete', 'Done', 'Closed'];
      statusOrder.forEach(status => {
        const count = analytics.status_distribution[status] || 0;
        const percentage = total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%';
        const trend = (status === 'Done' || status === 'Closed') ? '✓ Complete' : 
                     (status === 'In Progress' || status === 'Testing') ? '→ Active' : '○ Pending';
        statusData.push([status, count, percentage, trend]);
      });
      
      statusData.push([]);
      statusData.push(['Total Tasks', total, '100%', '']);
      
      // Add summary insights
      statusData.push([]);
      statusData.push(['STATUS INSIGHTS']);
      const activeCount = (analytics.status_distribution['In Progress'] || 0) + 
                         (analytics.status_distribution['Testing'] || 0);
      const completedCount = (analytics.status_distribution['Done'] || 0) + 
                            (analytics.status_distribution['Closed'] || 0);
      
      statusData.push(['Active Tasks (In Progress + Testing)', activeCount]);
      statusData.push(['Completed Tasks (Done + Closed)', completedCount]);
      statusData.push(['Completion Rate', total > 0 ? `${((completedCount / total) * 100).toFixed(1)}%` : '0%']);
      
      const ws2 = XLSX.utils.aoa_to_sheet(statusData);
      ws2['!cols'] = [
        { wch: 22 },  // Status names
        { wch: 12 },  // Count
        { wch: 15 },  // Percentage
        { wch: 15 }   // Trend
      ];
      
      ws2['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }  // Merge title
      ];
      
      XLSX.utils.book_append_sheet(wb, ws2, 'Status Analysis');
    }
    
    // ==================== UPCOMING DEADLINES ====================
    if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
      const deadlineData = createStyledHeader('Upcoming Deadlines & Due Tasks');
      
      // Add summary row
      const overdueCount = analytics.upcoming_deadlines.filter(t => t.days_until < 0).length;
      const criticalCount = analytics.upcoming_deadlines.filter(t => t.days_until >= 0 && t.days_until <= 3).length;
      
      deadlineData.push(['DEADLINE SUMMARY']);
      deadlineData.push(['Total Tasks with Deadlines', analytics.upcoming_deadlines.length]);
      deadlineData.push(['Overdue Tasks', overdueCount]);
      deadlineData.push(['Critical (≤3 days)', criticalCount]);
      deadlineData.push([]);
      
      deadlineData.push(['Ticket ID', 'Task Title', 'Priority', 'Status', 'Due Date', 'Days Until', 'Project', 'Urgency']);
      
      // Sort by urgency: overdue first, then by days until
      const sortedDeadlines = [...analytics.upcoming_deadlines].sort((a, b) => a.days_until - b.days_until);
      
      sortedDeadlines.forEach(task => {
        const daysUntil = task.days_until;
        let urgency = 'Low';
        if (daysUntil < 0) urgency = '🔴 OVERDUE';
        else if (daysUntil <= 3) urgency = '🔴 Critical';
        else if (daysUntil <= 7) urgency = '🟠 High';
        else if (daysUntil <= 14) urgency = '🟡 Medium';
        else urgency = '🟢 Low';
        
        const daysText = daysUntil < 0 
          ? `${Math.abs(daysUntil)} days overdue` 
          : `${daysUntil} days`;
        
        deadlineData.push([
          task.ticket_id || 'N/A',
          task.title || 'Untitled',
          task.priority || 'Medium',
          task.status || 'To Do',
          task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : 'No deadline',
          daysText,
          task.project_name || 'N/A',
          urgency
        ]);
      });
      
      const ws3 = XLSX.utils.aoa_to_sheet(deadlineData);
      ws3['!cols'] = [
        { wch: 12 },  // Ticket ID
        { wch: 45 },  // Task Title
        { wch: 12 },  // Priority
        { wch: 16 },  // Status
        { wch: 16 },  // Due Date
        { wch: 20 },  // Days Until
        { wch: 28 },  // Project
        { wch: 14 }   // Urgency
      ];
      
      ws3['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }  // Merge title
      ];
      
      XLSX.utils.book_append_sheet(wb, ws3, 'Deadlines');
    }
    
    // ==================== PROJECT PROGRESS ====================
    if (analytics.project_progress && analytics.project_progress.length > 0) {
      const projectData = createStyledHeader('Project Progress Dashboard');
      
      // Add summary statistics
      projectData.push(['PROJECT OVERVIEW']);
      projectData.push(['Total Projects', analytics.project_progress.length]);
      const avgProgress = analytics.project_progress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / analytics.project_progress.length;
      projectData.push(['Average Progress', `${avgProgress.toFixed(1)}%`]);
      
      const excellentProjects = analytics.project_progress.filter(p => (p.progress_percentage || 0) >= 80).length;
      const atRiskProjects = analytics.project_progress.filter(p => (p.progress_percentage || 0) < 40).length;
      projectData.push(['Excellent Projects (≥80%)', excellentProjects]);
      projectData.push(['At Risk Projects (<40%)', atRiskProjects]);
      
      projectData.push([]);
      projectData.push(['Project Name', 'Total Tasks', 'Completed', 'In Progress', 'Pending', 'Progress %', 'Health Status']);
      
      // Sort by progress percentage (highest first)
      const sortedProjects = [...analytics.project_progress].sort((a, b) => 
        (b.progress_percentage || 0) - (a.progress_percentage || 0)
      );
      
      sortedProjects.forEach(proj => {
        const progress = proj.progress_percentage || 0;
        let health = 'On Track';
        if (progress >= 80) health = '🟢 Excellent';
        else if (progress >= 60) health = '🟢 Good';
        else if (progress >= 40) health = '🟡 On Track';
        else if (progress >= 20) health = '🟠 At Risk';
        else health = '🔴 Needs Attention';
        
        projectData.push([
          proj.project_name || 'Unnamed Project',
          proj.total_tasks || 0,
          proj.completed_tasks || 0,
          proj.in_progress_tasks || 0,
          proj.pending_tasks || 0,
          `${progress}%`,
          health
        ]);
      });
      
      // Add footer summary
      projectData.push([]);
      projectData.push(['TOTALS']);
      const totalTasks = sortedProjects.reduce((sum, p) => sum + (p.total_tasks || 0), 0);
      const totalCompleted = sortedProjects.reduce((sum, p) => sum + (p.completed_tasks || 0), 0);
      const totalInProgress = sortedProjects.reduce((sum, p) => sum + (p.in_progress_tasks || 0), 0);
      const totalPending = sortedProjects.reduce((sum, p) => sum + (p.pending_tasks || 0), 0);
      const overallProgress = totalTasks > 0 ? ((totalCompleted / totalTasks) * 100).toFixed(1) : '0.0';
      
      projectData.push([
        'All Projects Combined',
        totalTasks,
        totalCompleted,
        totalInProgress,
        totalPending,
        `${overallProgress}%`,
        'Overall'
      ]);
      
      const ws4 = XLSX.utils.aoa_to_sheet(projectData);
      ws4['!cols'] = [
        { wch: 35 },  // Project Name
        { wch: 13 },  // Total Tasks
        { wch: 13 },  // Completed
        { wch: 13 },  // In Progress
        { wch: 13 },  // Pending
        { wch: 13 },  // Progress %
        { wch: 20 }   // Health Status
      ];
      
      ws4['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }  // Merge title
      ];
      
      XLSX.utils.book_append_sheet(wb, ws4, 'Project Progress');
    }
    
    // ==================== MY TASKS DETAILED ====================
    if (report && report.my_tasks && report.my_tasks.length > 0) {
      const tasksData = createStyledHeader('My Tasks - Detailed Report');
      
      // Add summary by status
      tasksData.push(['TASK BREAKDOWN']);
      const tasksByStatus = {};
      report.my_tasks.forEach(task => {
        const status = task.status || 'To Do';
        tasksByStatus[status] = (tasksByStatus[status] || 0) + 1;
      });
      
      Object.entries(tasksByStatus).forEach(([status, count]) => {
        tasksData.push([status, count]);
      });
      
      tasksData.push([]);
      tasksData.push(['Total Assigned Tasks', report.my_tasks.length]);
      tasksData.push([]);
      
      tasksData.push(['Ticket ID', 'Title', 'Status', 'Priority', 'Due Date', 'Project', 'Assigned Date', 'Age (Days)']);
      
      // Sort by priority (High → Medium → Low) and then by due date
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      const sortedTasks = [...report.my_tasks].sort((a, b) => {
        const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        if (priorityDiff !== 0) return priorityDiff;
        
        const dateA = a.due_date ? new Date(a.due_date) : new Date('2099-12-31');
        const dateB = b.due_date ? new Date(b.due_date) : new Date('2099-12-31');
        return dateA - dateB;
      });
      
      sortedTasks.forEach(task => {
        const createdDate = task.created_at ? new Date(task.created_at) : new Date();
        const ageDays = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
        
        tasksData.push([
          task.ticket_id || 'N/A',
          task.title || 'Untitled',
          task.status || 'To Do',
          task.priority || 'Medium',
          task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'No deadline',
          task.project_name || 'N/A',
          task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A',
          ageDays
        ]);
      });
      
      const ws5 = XLSX.utils.aoa_to_sheet(tasksData);
      ws5['!cols'] = [
        { wch: 12 },  // Ticket ID
        { wch: 45 },  // Title
        { wch: 16 },  // Status
        { wch: 12 },  // Priority
        { wch: 16 },  // Due Date
        { wch: 28 },  // Project
        { wch: 16 },  // Assigned Date
        { wch: 12 }   // Age
      ];
      
      ws5['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }  // Merge title
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
    const insights = createStyledHeader('Insights & Recommendations');
    
    insights.push(['Category', 'Insight', 'Recommendation', 'Priority']);
    
    // Generate dynamic insights with priorities
    const totalTasks = analytics.task_stats?.total || 0;
    const completionRatePct = totalTasks > 0 
      ? ((analytics.task_stats.closed / totalTasks) * 100)
      : 0;
    
    if (completionRatePct < 50) {
      insights.push([
        'Task Completion',
        `Completion rate is ${completionRatePct.toFixed(1)}% (below 50% target)`,
        'Focus on completing pending tasks. Review task priorities and remove blockers. Consider breaking large tasks into smaller chunks.',
        '🔴 High'
      ]);
    } else if (completionRatePct < 70) {
      insights.push([
        'Task Completion',
        `Completion rate is ${completionRatePct.toFixed(1)}% (below 70% target)`,
        'Good progress, but room for improvement. Review workflow efficiency.',
        '🟡 Medium'
      ]);
    } else {
      insights.push([
        'Task Completion',
        `Completion rate is ${completionRatePct.toFixed(1)}% (excellent performance)`,
        'Maintain current pace and continue monitoring for bottlenecks.',
        '🟢 Low'
      ]);
    }
    
    const overdueCount = analytics.task_stats?.overdue || 0;
    if (overdueCount > 0) {
      const urgency = overdueCount > 5 ? '🔴 Critical' : overdueCount > 2 ? '🔴 High' : '🟠 Medium';
      insights.push([
        'Overdue Tasks',
        `${overdueCount} task${overdueCount > 1 ? 's are' : ' is'} overdue`,
        'Prioritize overdue tasks immediately. Review deadlines and resource allocation. Communicate delays to stakeholders.',
        urgency
      ]);
    }
    
    const highPriorityTasks = analytics.priority_distribution?.High || 0;
    const highPriorityPct = totalTasks > 0 ? (highPriorityTasks / totalTasks) * 100 : 0;
    
    if (highPriorityPct > 40) {
      insights.push([
        'Priority Distribution',
        `${highPriorityTasks} high-priority tasks (${highPriorityPct.toFixed(1)}% of total)`,
        'Too many high-priority tasks may indicate poor prioritization. Review and re-evaluate task priorities. Not everything can be urgent.',
        '🟠 Medium'
      ]);
    }
    
    const inProgressCount = analytics.task_stats?.in_progress || 0;
    const inProgressPct = totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0;
    
    if (inProgressPct > 50) {
      insights.push([
        'Work In Progress',
        `${inProgressCount} tasks in progress (${inProgressPct.toFixed(1)}% of total)`,
        'Too many concurrent tasks may reduce focus. Consider limiting WIP (Work In Progress) to improve completion rate.',
        '🟡 Medium'
      ]);
    }
    
    const projectCount = analytics.project_stats?.total || 0;
    if (projectCount > 10) {
      insights.push([
        'Project Management',
        `Managing ${projectCount} projects simultaneously`,
        'Consider consolidating projects or delegating ownership for better focus and reduced context switching.',
        '🟡 Medium'
      ]);
    }
    
    const pendingCount = analytics.task_stats?.pending || 0;
    if (pendingCount > totalTasks * 0.3) {
      insights.push([
        'Pending Tasks',
        `${pendingCount} tasks are pending (${((pendingCount / totalTasks) * 100).toFixed(1)}%)`,
        'High number of pending tasks. Review and start working on high-priority items. Clarify requirements if tasks are blocked.',
        '🟡 Medium'
      ]);
    }
    
    // Add positive insight if performance is good
    if (completionRatePct >= 70 && overdueCount === 0) {
      insights.push([
        'Performance',
        'Excellent task management performance',
        'Continue current practices. Regular monitoring and proactive planning are key to sustained success.',
        '🟢 Info'
      ]);
    }
    
    insights.push([]);
    insights.push(['REPORT METADATA']);
    insights.push(['Generated By', userName]);
    insights.push(['Generation Date', currentDate]);
    insights.push(['Generation Time', new Date().toLocaleTimeString('en-US')]);
    insights.push(['Total Data Points', totalTasks]);
    insights.push(['Report Format', 'Microsoft Excel Workbook (.xlsx)']);
    
    const ws7 = XLSX.utils.aoa_to_sheet(insights);
    ws7['!cols'] = [
      { wch: 22 },  // Category
      { wch: 50 },  // Insight
      { wch: 65 },  // Recommendation
      { wch: 14 }   // Priority
    ];
    
    ws7['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }  // Merge title
    ];
    
    XLSX.utils.book_append_sheet(wb, ws7, 'Insights');
    
    // Generate and download with professional naming
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `DOIT-Dashboard-Report-${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error('Failed to generate Excel: ' + error.message);
  }
};

/**
 * Enhanced CSV Export with Professional Formatting
 */
export const exportToCSV = (analytics, userName) => {
  try {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const currentTime = new Date().toLocaleTimeString('en-US');
    
    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    let csv = '';
    
    // =======================================================================
    // HEADER SECTION
    // =======================================================================
    csv += '=======================================================================\n';
    csv += '                     DOIT DASHBOARD REPORT\n';
    csv += '                   Task Management Analytics\n';
    csv += '=======================================================================\n';
    csv += `Generated for: ${escapeCSV(userName)}\n`;
    csv += `Report Date: ${currentDate}\n`;
    csv += `Report Time: ${currentTime}\n`;
    csv += `Report Type: Comprehensive CSV Export\n`;
    csv += '=======================================================================\n\n';
    
    // -----------------------------------------------------------------------
    // EXECUTIVE SUMMARY
    // -----------------------------------------------------------------------
    csv += '+---------------------------------------------------------------------+\n';
    csv += '|                       EXECUTIVE SUMMARY                             |\n';
    csv += '+---------------------------------------------------------------------+\n\n';
    
    // Key Performance Indicators
    csv += '>>> KEY PERFORMANCE INDICATORS\n';
    csv += 'Metric,Value,Status\n';
    
    const totalTasks = analytics.task_stats?.total || 0;
    const completionRate = totalTasks > 0 
      ? ((analytics.task_stats.closed / totalTasks) * 100).toFixed(1)
      : '0.0';
    const completionStatus = parseFloat(completionRate) >= 70 ? 'Good' : 'Needs Improvement';
    
    csv += `Completion Rate,${completionRate}%,${completionStatus}\n`;
    
    const overdueCount = analytics.task_stats?.overdue || 0;
    const onTimeRate = totalTasks > 0 
      ? (((totalTasks - overdueCount) / totalTasks) * 100).toFixed(1)
      : '100.0';
    const onTimeStatus = overdueCount === 0 ? 'Excellent' : 'Review Required';
    
    csv += `On-Time Delivery,${onTimeRate}%,${onTimeStatus}\n`;
    
    const activeTasks = (analytics.task_stats?.pending || 0) + (analytics.task_stats?.in_progress || 0);
    csv += `Active Tasks,${activeTasks},${activeTasks} tasks in progress\n`;
    csv += `Overdue Tasks,${overdueCount},${overdueCount > 0 ? 'Requires Attention' : 'All on track'}\n`;
    csv += '\n';
    
    // -----------------------------------------------------------------------
    // TASK STATISTICS
    // -----------------------------------------------------------------------
    csv += '+---------------------------------------------------------------------+\n';
    csv += '|                       TASK STATISTICS                               |\n';
    csv += '+---------------------------------------------------------------------+\n\n';
    
    csv += 'Metric,Count,Percentage,Trend\n';
    csv += `Total Tasks,${totalTasks},100%,Baseline\n`;
    csv += `Pending Tasks,${analytics.task_stats?.pending || 0},${totalTasks > 0 ? ((analytics.task_stats.pending / totalTasks) * 100).toFixed(1) : 0}%,Awaiting Start\n`;
    csv += `In Progress,${analytics.task_stats?.in_progress || 0},${totalTasks > 0 ? ((analytics.task_stats.in_progress / totalTasks) * 100).toFixed(1) : 0}%,Active Work\n`;
    csv += `Overdue Tasks,${overdueCount},${totalTasks > 0 ? ((overdueCount / totalTasks) * 100).toFixed(1) : 0}%,${overdueCount > 0 ? 'Critical' : 'None'}\n`;
    csv += '\n';
    
    // -----------------------------------------------------------------------
    // STATUS DISTRIBUTION (Workflow Order)
    // -----------------------------------------------------------------------
    if (analytics.status_distribution) {
      csv += '+---------------------------------------------------------------------+\n';
      csv += '|                    STATUS DISTRIBUTION                              |\n';
      csv += '|                  (6-Stage Workflow Analysis)                        |\n';
      csv += '+---------------------------------------------------------------------+\n\n';
      
      csv += 'Status,Count,Percentage,Stage,Trend\n';
      
      const statusTotal = Object.values(analytics.status_distribution).reduce((sum, count) => sum + count, 0);
      const statusOrder = [
        { name: 'To Do', stage: '1', trend: 'Pending' },
        { name: 'In Progress', stage: '2', trend: 'Active' },
        { name: 'Testing', stage: '3', trend: 'Active' },
        { name: 'Dev Complete', stage: '4', trend: 'Active' },
        { name: 'Done', stage: '5', trend: 'Complete' },
        { name: 'Closed', stage: '6', trend: 'Complete' }
      ];
      
      statusOrder.forEach(({ name, stage, trend }) => {
        const count = analytics.status_distribution[name] || 0;
        const percentage = statusTotal > 0 ? ((count / statusTotal) * 100).toFixed(1) : '0.0';
        csv += `${name},${count},${percentage}%,Stage ${stage},${trend}\n`;
      });
      
      const activeCount = (analytics.status_distribution['In Progress'] || 0) + 
                          (analytics.status_distribution['Testing'] || 0);
      const completedCount = (analytics.status_distribution['Done'] || 0) + 
                             (analytics.status_distribution['Closed'] || 0);
      
      csv += '\n>>> STATUS INSIGHTS\n';
      csv += 'Insight,Value\n';
      csv += `Total Tasks,${statusTotal}\n`;
      csv += `Active Tasks (In Progress + Testing),${activeCount}\n`;
      csv += `Completed Tasks (Done + Closed),${completedCount}\n`;
      csv += `Workflow Completion Rate,${statusTotal > 0 ? ((completedCount / statusTotal) * 100).toFixed(1) : '0.0'}%\n`;
      csv += '\n';
    }
    
    // -----------------------------------------------------------------------
    // PRIORITY DISTRIBUTION
    // -----------------------------------------------------------------------
    csv += '+---------------------------------------------------------------------+\n';
    csv += '|                    PRIORITY DISTRIBUTION                            |\n';
    csv += '+---------------------------------------------------------------------+\n\n';
    
    csv += 'Priority,Count,Percentage,Risk Level\n';
    const highCount = analytics.priority_distribution?.High || 0;
    const mediumCount = analytics.priority_distribution?.Medium || 0;
    const lowCount = analytics.priority_distribution?.Low || 0;
    
    csv += `High,${highCount},${totalTasks > 0 ? ((highCount / totalTasks) * 100).toFixed(1) : 0}%,Critical\n`;
    csv += `Medium,${mediumCount},${totalTasks > 0 ? ((mediumCount / totalTasks) * 100).toFixed(1) : 0}%,Standard\n`;
    csv += `Low,${lowCount},${totalTasks > 0 ? ((lowCount / totalTasks) * 100).toFixed(1) : 0}%,Normal\n`;
    csv += '\n';
    
    // -----------------------------------------------------------------------
    // PROJECT STATISTICS
    // -----------------------------------------------------------------------
    csv += '+---------------------------------------------------------------------+\n';
    csv += '|                     PROJECT STATISTICS                              |\n';
    csv += '+---------------------------------------------------------------------+\n\n';
    
    csv += 'Metric,Count\n';
    csv += `Total Projects,${analytics.project_stats?.total || 0}\n`;
    csv += `Owned Projects,${analytics.project_stats?.owned || 0}\n`;
    csv += `Member Projects,${analytics.project_stats?.member_of || 0}\n`;
    csv += '\n';
    
    // -----------------------------------------------------------------------
    // PROJECT PROGRESS DETAILS
    // -----------------------------------------------------------------------
    if (analytics.project_progress && analytics.project_progress.length > 0) {
      csv += '+---------------------------------------------------------------------+\n';
      csv += '|                     PROJECT PROGRESS                                |\n';
      csv += '+---------------------------------------------------------------------+\n\n';
      
      // Summary first
      const avgProgress = analytics.project_progress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / analytics.project_progress.length;
      const excellentProjects = analytics.project_progress.filter(p => (p.progress_percentage || 0) >= 80).length;
      const atRiskProjects = analytics.project_progress.filter(p => (p.progress_percentage || 0) < 40).length;
      
      csv += '>>> PROJECT OVERVIEW\n';
      csv += 'Metric,Value\n';
      csv += `Total Projects,${analytics.project_progress.length}\n`;
      csv += `Average Progress,${avgProgress.toFixed(1)}%\n`;
      csv += `Excellent Projects (≥80%),${excellentProjects}\n`;
      csv += `At Risk Projects (<40%),${atRiskProjects}\n`;
      csv += '\n';
      
      csv += '>>> DETAILED PROJECT BREAKDOWN\n';
      csv += 'Project Name,Total Tasks,Completed,In Progress,Pending,Progress %,Health Status\n';
      
      // Sort by progress (highest first)
      const sortedProjects = [...analytics.project_progress].sort((a, b) => 
        (b.progress_percentage || 0) - (a.progress_percentage || 0)
      );
      
      sortedProjects.forEach(proj => {
        const progress = proj.progress_percentage || 0;
        let health = 'On Track';
        if (progress >= 80) health = 'Excellent';
        else if (progress >= 60) health = 'Good';
        else if (progress >= 40) health = 'On Track';
        else if (progress >= 20) health = 'At Risk';
        else health = 'Needs Attention';
        
        csv += `${escapeCSV(proj.project_name)},${proj.total_tasks || 0},${proj.completed_tasks || 0},${proj.in_progress_tasks || 0},${proj.pending_tasks || 0},${progress}%,${health}\n`;
      });
      
      // Totals
      const totalProjectTasks = sortedProjects.reduce((sum, p) => sum + (p.total_tasks || 0), 0);
      const totalCompleted = sortedProjects.reduce((sum, p) => sum + (p.completed_tasks || 0), 0);
      const totalInProgress = sortedProjects.reduce((sum, p) => sum + (p.in_progress_tasks || 0), 0);
      const totalPending = sortedProjects.reduce((sum, p) => sum + (p.pending_tasks || 0), 0);
      const overallProgress = totalProjectTasks > 0 ? ((totalCompleted / totalProjectTasks) * 100).toFixed(1) : '0.0';
      
      csv += `\n>>> COMBINED TOTALS\n`;
      csv += `All Projects,${totalProjectTasks},${totalCompleted},${totalInProgress},${totalPending},${overallProgress}%,Overall\n`;
      csv += '\n';
    }
    
    // -----------------------------------------------------------------------
    // UPCOMING DEADLINES & URGENCY ANALYSIS
    // -----------------------------------------------------------------------
    if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
      csv += '+---------------------------------------------------------------------+\n';
      csv += '|                  UPCOMING DEADLINES & URGENCY                       |\n';
      csv += '+---------------------------------------------------------------------+\n\n';
      
      // Summary
      const overdueDeadlines = analytics.upcoming_deadlines.filter(t => t.days_until < 0).length;
      const criticalDeadlines = analytics.upcoming_deadlines.filter(t => t.days_until >= 0 && t.days_until <= 3).length;
      const highDeadlines = analytics.upcoming_deadlines.filter(t => t.days_until > 3 && t.days_until <= 7).length;
      
      csv += '>>> DEADLINE SUMMARY\n';
      csv += 'Category,Count\n';
      csv += `Total Tasks with Deadlines,${analytics.upcoming_deadlines.length}\n`;
      csv += `Overdue (Past Due),${overdueDeadlines}\n`;
      csv += `Critical (≤3 days),${criticalDeadlines}\n`;
      csv += `High Priority (4-7 days),${highDeadlines}\n`;
      csv += '\n';
      
      csv += '>>> DEADLINE DETAILS (Sorted by Urgency)\n';
      csv += 'Ticket ID,Task Title,Priority,Status,Due Date,Days Until,Project,Urgency Level\n';
      
      // Sort by urgency
      const sortedDeadlines = [...analytics.upcoming_deadlines].sort((a, b) => a.days_until - b.days_until);
      
      sortedDeadlines.forEach(task => {
        const daysUntil = task.days_until;
        let urgency = 'Low';
        if (daysUntil < 0) urgency = 'OVERDUE';
        else if (daysUntil <= 3) urgency = 'Critical';
        else if (daysUntil <= 7) urgency = 'High';
        else if (daysUntil <= 14) urgency = 'Medium';
        
        const daysText = daysUntil < 0 
          ? `${Math.abs(daysUntil)} days overdue` 
          : `${daysUntil} days`;
        
        const dueDate = new Date(task.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        csv += `${task.ticket_id || 'N/A'},${escapeCSV(task.title)},${task.priority || 'Medium'},${task.status || 'To Do'},${dueDate},${daysText},${escapeCSV(task.project_name)},${urgency}\n`;
      });
      csv += '\n';
    }
    
    // -----------------------------------------------------------------------
    // INSIGHTS & RECOMMENDATIONS
    // -----------------------------------------------------------------------
    csv += '+---------------------------------------------------------------------+\n';
    csv += '|                 INSIGHTS & RECOMMENDATIONS                          |\n';
    csv += '+---------------------------------------------------------------------+\n\n';
    
    csv += 'Category,Insight,Recommendation,Priority\n';
    
    const completionRatePct = parseFloat(completionRate);
    
    if (completionRatePct < 50) {
      csv += `Task Completion,${escapeCSV(`Completion rate is ${completionRate}% (below 50% target)`)},${escapeCSV('Focus on completing pending tasks. Review task priorities and remove blockers.')},High\n`;
    } else if (completionRatePct < 70) {
      csv += `Task Completion,${escapeCSV(`Completion rate is ${completionRate}% (below 70% target)`)},${escapeCSV('Good progress but room for improvement. Review workflow efficiency.')},Medium\n`;
    } else {
      csv += `Task Completion,${escapeCSV(`Completion rate is ${completionRate}% (excellent)`)},${escapeCSV('Maintain current pace and monitor for bottlenecks.')},Low\n`;
    }
    
    if (overdueCount > 0) {
      const urgency = overdueCount > 5 ? 'Critical' : overdueCount > 2 ? 'High' : 'Medium';
      csv += `Overdue Tasks,${escapeCSV(`${overdueCount} task(s) overdue`)},${escapeCSV('Prioritize overdue tasks immediately. Review resource allocation.')},${urgency}\n`;
    }
    
    const highPriorityPct = totalTasks > 0 ? (highCount / totalTasks) * 100 : 0;
    if (highPriorityPct > 40) {
      csv += `Priority Distribution,${escapeCSV(`${highCount} high-priority tasks (${highPriorityPct.toFixed(1)}%)`)},${escapeCSV('Too many high-priority tasks. Review and re-evaluate priorities.')},Medium\n`;
    }
    
    const inProgressCount = analytics.task_stats?.in_progress || 0;
    const inProgressPct = totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0;
    if (inProgressPct > 50) {
      csv += `Work In Progress,${escapeCSV(`${inProgressCount} tasks in progress (${inProgressPct.toFixed(1)}%)`)},${escapeCSV('Consider limiting WIP to improve focus and completion rate.')},Medium\n`;
    }
    
    if (completionRatePct >= 70 && overdueCount === 0) {
      csv += `Performance,${escapeCSV('Excellent task management performance')},${escapeCSV('Continue current practices. Regular monitoring recommended.')},Info\n`;
    }
    
    csv += '\n';
    
    // =======================================================================
    // FOOTER SECTION
    // =======================================================================
    csv += '=======================================================================\n';
    csv += '                         REPORT METADATA\n';
    csv += '=======================================================================\n';
    csv += `Generated By: ${escapeCSV(userName)}\n`;
    csv += `Generation Date: ${currentDate}\n`;
    csv += `Generation Time: ${currentTime}\n`;
    csv += `Report Format: CSV (Comma-Separated Values)\n`;
    csv += `Total Data Points: ${totalTasks} tasks across ${analytics.project_stats?.total || 0} projects\n`;
    csv += `Report Version: 1.0\n`;
    csv += `System: DOIT Task Management System\n`;
    csv += '=======================================================================\n';
    csv += 'End of Report\n';
    csv += '=======================================================================\n';
    
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