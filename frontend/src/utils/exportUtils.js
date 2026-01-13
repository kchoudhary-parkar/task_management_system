import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export dashboard data to PDF format
 */
export const exportToPDF = (analytics, userName) => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text('Dashboard Report', 14, 22);
  
  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated for: ${userName}`, 14, 30);
  doc.text(`Date: ${currentDate}`, 14, 36);
  
  let yPosition = 46;
  
  // Task Statistics
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Task Statistics', 14, yPosition);
  yPosition += 8;
  
  const taskStatsData = [
    ['Metric', 'Count'],
    ['Total Tasks', analytics.task_stats.total.toString()],
    ['Pending Tasks', analytics.task_stats.pending.toString()],
    ['In Progress', analytics.task_stats.in_progress.toString()],
    ['Completed Tasks', analytics.task_stats.closed.toString()],
    ['Overdue Tasks', analytics.task_stats.overdue.toString()]
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [taskStatsData[0]],
    body: taskStatsData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Project Statistics
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Project Statistics', 14, yPosition);
  yPosition += 8;
  
  const projectStatsData = [
    ['Metric', 'Count'],
    ['Total Projects', analytics.project_stats.total.toString()],
    ['Owned Projects', analytics.project_stats.owned.toString()],
    ['Member Of', analytics.project_stats.member_of.toString()],
    ['Active Projects', analytics.project_stats.active.toString()]
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [projectStatsData[0]],
    body: projectStatsData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Priority Distribution
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Task Priority Distribution', 14, yPosition);
  yPosition += 8;
  
  const priorityData = [
    ['Priority', 'Count'],
    ['High', analytics.priority_distribution.High.toString()],
    ['Medium', analytics.priority_distribution.Medium.toString()],
    ['Low', analytics.priority_distribution.Low.toString()]
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [priorityData[0]],
    body: priorityData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11] },
    styles: { fontSize: 10 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Upcoming Deadlines
  if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Upcoming Deadlines', 14, yPosition);
    yPosition += 8;
    
    const deadlineData = analytics.upcoming_deadlines.slice(0, 10).map(task => [
      task.title,
      task.priority,
      new Date(task.due_date).toLocaleDateString(),
      task.project_name
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Task', 'Priority', 'Due Date', 'Project']],
      body: deadlineData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 55 }
      }
    });
  }
  
  // Save the PDF
  doc.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export dashboard data to Excel format
 */
export const exportToExcel = (analytics, report, userName) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Task Statistics Sheet
  const taskStatsData = [
    ['Dashboard Report'],
    [`Generated for: ${userName}`],
    [`Date: ${new Date().toLocaleDateString()}`],
    [],
    ['Task Statistics'],
    ['Metric', 'Count'],
    ['Total Tasks', analytics.task_stats.total],
    ['Pending Tasks', analytics.task_stats.pending],
    ['In Progress', analytics.task_stats.in_progress],
    ['Completed Tasks', analytics.task_stats.closed],
    ['Overdue Tasks', analytics.task_stats.overdue],
    [],
    ['Project Statistics'],
    ['Metric', 'Count'],
    ['Total Projects', analytics.project_stats.total],
    ['Owned Projects', analytics.project_stats.owned],
    ['Member Of', analytics.project_stats.member_of],
    ['Active Projects', analytics.project_stats.active]
  ];
  
  const ws1 = XLSX.utils.aoa_to_sheet(taskStatsData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
  
  // Priority Distribution Sheet
  const priorityData = [
    ['Priority Distribution'],
    [],
    ['Priority', 'Count'],
    ['High', analytics.priority_distribution.High],
    ['Medium', analytics.priority_distribution.Medium],
    ['Low', analytics.priority_distribution.Low]
  ];
  
  const ws2 = XLSX.utils.aoa_to_sheet(priorityData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Priority');
  
  // Upcoming Deadlines Sheet
  if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
    const deadlineData = [
      ['Upcoming Deadlines'],
      [],
      ['Task', 'Priority', 'Due Date', 'Project', 'Status', 'Days Until'],
      ...analytics.upcoming_deadlines.map(task => [
        task.title,
        task.priority,
        new Date(task.due_date).toLocaleDateString(),
        task.project_name,
        task.status,
        task.days_until
      ])
    ];
    
    const ws3 = XLSX.utils.aoa_to_sheet(deadlineData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Deadlines');
  }
  
  // Project Progress Sheet
  if (analytics.project_progress && analytics.project_progress.length > 0) {
    const projectData = [
      ['Project Progress'],
      [],
      ['Project', 'Total Tasks', 'Completed', 'Progress %'],
      ...analytics.project_progress.map(proj => [
        proj.project_name,
        proj.total_tasks,
        proj.completed_tasks,
        proj.progress_percentage
      ])
    ];
    
    const ws4 = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Projects');
  }
  
  // My Tasks Sheet (if report data is available)
  if (report && report.my_tasks && report.my_tasks.length > 0) {
    const tasksData = [
      ['My Tasks'],
      [],
      ['Ticket ID', 'Title', 'Status', 'Priority', 'Due Date', 'Project'],
      ...report.my_tasks.map(task => [
        task.ticket_id || '',
        task.title,
        task.status,
        task.priority,
        task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline',
        task.project_name
      ])
    ];
    
    const ws5 = XLSX.utils.aoa_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(wb, ws5, 'My Tasks');
  }
  
  // Generate and download
  XLSX.writeFile(wb, `dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export to CSV format (simple version)
 */
export const exportToCSV = (analytics, userName) => {
  let csv = 'Dashboard Report\n';
  csv += `Generated for: ${userName}\n`;
  csv += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  csv += 'Task Statistics\n';
  csv += 'Metric,Count\n';
  csv += `Total Tasks,${analytics.task_stats.total}\n`;
  csv += `Pending Tasks,${analytics.task_stats.pending}\n`;
  csv += `In Progress,${analytics.task_stats.in_progress}\n`;
  csv += `Completed Tasks,${analytics.task_stats.closed}\n`;
  csv += `Overdue Tasks,${analytics.task_stats.overdue}\n\n`;
  
  csv += 'Project Statistics\n';
  csv += 'Metric,Count\n';
  csv += `Total Projects,${analytics.project_stats.total}\n`;
  csv += `Owned Projects,${analytics.project_stats.owned}\n`;
  csv += `Member Of,${analytics.project_stats.member_of}\n`;
  csv += `Active Projects,${analytics.project_stats.active}\n\n`;
  
  csv += 'Priority Distribution\n';
  csv += 'Priority,Count\n';
  csv += `High,${analytics.priority_distribution.High}\n`;
  csv += `Medium,${analytics.priority_distribution.Medium}\n`;
  csv += `Low,${analytics.priority_distribution.Low}\n\n`;
  
  if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
    csv += 'Upcoming Deadlines\n';
    csv += 'Task,Priority,Due Date,Project\n';
    analytics.upcoming_deadlines.forEach(task => {
      csv += `"${task.title}",${task.priority},${new Date(task.due_date).toLocaleDateString()},"${task.project_name}"\n`;
    });
  }
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
