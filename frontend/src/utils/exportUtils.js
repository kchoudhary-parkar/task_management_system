import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Export dashboard data to PDF format (simplified without autoTable)
 */
export const exportToPDF = (analytics, userName) => {
  try {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;
    
    // Header Background
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DOIT Dashboard Report', pageWidth / 2, 25, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated for: ${userName}`, pageWidth / 2, 35, { align: 'center' });
    doc.text(`Date: ${currentDate}`, pageWidth / 2, 42, { align: 'center' });
    
    yPosition = 65;
    
    // Helper function to draw a simple table
    const drawTable = (title, data, startY) => {
      let y = startY;
      
      // Check if we need a new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Section title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(title, 14, y);
      y += 10;
      
      // Table
      doc.setFontSize(10);
      
      data.forEach((row, index) => {
        if (index === 0) {
          // Header row
          doc.setFillColor(59, 130, 246);
          doc.rect(14, y - 6, 120, 8, 'F');
          doc.rect(134, y - 6, 50, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
        } else {
          // Data rows
          doc.setTextColor(30, 41, 59);
          doc.setFont('helvetica', 'normal');
          if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y - 6, 120, 8, 'F');
            doc.rect(134, y - 6, 50, 8, 'F');
          }
        }
        
        doc.text(row[0], 16, y);
        doc.text(row[1].toString(), 136, y);
        y += 8;
      });
      
      return y + 8;
    };
    
    // Task Statistics
    const taskStatsData = [
      ['Metric', 'Count'],
      ['Total Tasks', analytics.task_stats?.total || 0],
      ['Pending Tasks', analytics.task_stats?.pending || 0],
      ['In Progress', analytics.task_stats?.in_progress || 0],
      ['Completed Tasks', analytics.task_stats?.closed || 0],
      ['Overdue Tasks', analytics.task_stats?.overdue || 0]
    ];
    
    yPosition = drawTable('Task Statistics', taskStatsData, yPosition);
    
    // Project Statistics
    const projectStatsData = [
      ['Metric', 'Count'],
      ['Total Projects', analytics.project_stats?.total || 0],
      ['Owned Projects', analytics.project_stats?.owned || 0],
      ['Member Of', analytics.project_stats?.member_of || 0],
      ['Active Projects', analytics.project_stats?.active || 0]
    ];
    
    yPosition = drawTable('Project Statistics', projectStatsData, yPosition);
    
    // Priority Distribution
    const priorityData = [
      ['Priority', 'Count'],
      ['High', analytics.priority_distribution?.High || 0],
      ['Medium', analytics.priority_distribution?.Medium || 0],
      ['Low', analytics.priority_distribution?.Low || 0]
    ];
    
    yPosition = drawTable('Priority Distribution', priorityData, yPosition);
    
    // Status Distribution
    if (analytics.status_distribution) {
      const statusData = [['Status', 'Count']];
      Object.entries(analytics.status_distribution).forEach(([status, count]) => {
        statusData.push([status, count]);
      });
      yPosition = drawTable('Status Distribution', statusData, yPosition);
    }
    
    // Upcoming Deadlines
    if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
      doc.addPage();
      yPosition = 20;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Upcoming Deadlines', 14, yPosition);
      yPosition += 10;
      
      doc.setFontSize(9);
      analytics.upcoming_deadlines.slice(0, 20).forEach((task, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`${index + 1}. ${task.title.substring(0, 60)}`, 14, yPosition);
        yPosition += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Priority: ${task.priority} | Due: ${new Date(task.due_date).toLocaleDateString()}`, 20, yPosition);
        yPosition += 6;
        
        doc.text(`Project: ${task.project_name || 'N/A'}`, 20, yPosition);
        yPosition += 10;
      });
    }
    
    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Page ${i} of ${pageCount} | Generated by DOIT Task Management System`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`DOIT-Dashboard-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};

/**
 * Export dashboard data to Excel format with proper formatting
 */
export const exportToExcel = (analytics, report, userName) => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // ==================== SUMMARY SHEET ====================
    const summaryData = [
      ['DOIT Dashboard Report'],
      [`Generated for: ${userName}`],
      [`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`],
      [],
      ['TASK STATISTICS'],
      ['Metric', 'Count'],
      ['Total Tasks', analytics.task_stats?.total || 0],
      ['Pending Tasks', analytics.task_stats?.pending || 0],
      ['In Progress', analytics.task_stats?.in_progress || 0],
      ['Completed Tasks', analytics.task_stats?.closed || 0],
      ['Overdue Tasks', analytics.task_stats?.overdue || 0],
      [],
      ['PROJECT STATISTICS'],
      ['Metric', 'Count'],
      ['Total Projects', analytics.project_stats?.total || 0],
      ['Owned Projects', analytics.project_stats?.owned || 0],
      ['Member Of', analytics.project_stats?.member_of || 0],
      ['Active Projects', analytics.project_stats?.active || 0],
      [],
      ['PRIORITY DISTRIBUTION'],
      ['Metric', 'Count'],
      ['High', analytics.priority_distribution?.High || 0],
      ['Medium', analytics.priority_distribution?.Medium || 0],
      ['Low', analytics.priority_distribution?.Low || 0]
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths
    ws1['!cols'] = [
      { wch: 30 },  // Column A
      { wch: 15 }   // Column B
    ];
    
    // Merge cells for title
    ws1['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Title row
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // Task Statistics header
      { s: { r: 12, c: 0 }, e: { r: 12, c: 1 } }, // Project Statistics header
      { s: { r: 19, c: 0 }, e: { r: 19, c: 1 } }  // Priority Distribution header
    ];
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
    
    // ==================== STATUS DISTRIBUTION SHEET ====================
    if (analytics.status_distribution) {
      const statusData = [
        ['Task Status Distribution'],
        [],
        ['Status', 'Count', 'Percentage']
      ];
      
      const total = Object.values(analytics.status_distribution).reduce((sum, count) => sum + count, 0);
      
      Object.entries(analytics.status_distribution).forEach(([status, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%';
        statusData.push([status, count, percentage]);
      });
      
      const ws2 = XLSX.utils.aoa_to_sheet(statusData);
      ws2['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }];
      ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
      
      XLSX.utils.book_append_sheet(wb, ws2, 'Status Distribution');
    }
    
    // ==================== UPCOMING DEADLINES SHEET ====================
    if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
      const deadlineData = [
        ['Upcoming Deadlines'],
        [],
        ['Task', 'Priority', 'Status', 'Due Date', 'Days Until', 'Project']
      ];
      
      analytics.upcoming_deadlines.forEach(task => {
        deadlineData.push([
          task.title || 'Untitled',
          task.priority || 'Medium',
          task.status || 'To Do',
          task.due_date ? new Date(task.due_date).toLocaleDateString('en-US') : 'No deadline',
          task.days_until < 0 ? `${Math.abs(task.days_until)} days overdue` : `${task.days_until} days left`,
          task.project_name || 'N/A'
        ]);
      });
      
      const ws3 = XLSX.utils.aoa_to_sheet(deadlineData);
      ws3['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 25 }];
      ws3['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
      
      XLSX.utils.book_append_sheet(wb, ws3, 'Deadlines');
    }
    
    // ==================== PROJECT PROGRESS SHEET ====================
    if (analytics.project_progress && analytics.project_progress.length > 0) {
      const projectData = [
        ['Project Progress Overview'],
        [],
        ['Project Name', 'Total Tasks', 'Completed', 'In Progress', 'Pending', 'Progress %']
      ];
      
      analytics.project_progress.forEach(proj => {
        projectData.push([
          proj.project_name || 'Unnamed Project',
          proj.total_tasks || 0,
          proj.completed_tasks || 0,
          proj.in_progress_tasks || 0,
          proj.pending_tasks || 0,
          (proj.progress_percentage || 0) + '%'
        ]);
      });
      
      const ws4 = XLSX.utils.aoa_to_sheet(projectData);
      ws4['!cols'] = [{ wch: 30 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 13 }];
      ws4['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
      
      XLSX.utils.book_append_sheet(wb, ws4, 'Project Progress');
    }
    
    // ==================== MY TASKS SHEET ====================
    if (report && report.my_tasks && report.my_tasks.length > 0) {
      const tasksData = [
        ['My Tasks Detailed Report'],
        [],
        ['Ticket ID', 'Title', 'Status', 'Priority', 'Due Date', 'Project', 'Assigned Date']
      ];
      
      report.my_tasks.forEach(task => {
        tasksData.push([
          task.ticket_id || 'N/A',
          task.title || 'Untitled',
          task.status || 'To Do',
          task.priority || 'Medium',
          task.due_date ? new Date(task.due_date).toLocaleDateString('en-US') : 'No deadline',
          task.project_name || 'N/A',
          task.created_at ? new Date(task.created_at).toLocaleDateString('en-US') : 'N/A'
        ]);
      });
      
      const ws5 = XLSX.utils.aoa_to_sheet(tasksData);
      ws5['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 15 }];
      ws5['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
      
      XLSX.utils.book_append_sheet(wb, ws5, 'My Tasks');
    }
    
    // ==================== RECENT ACTIVITY SHEET ====================
    if (analytics.recent_activities && analytics.recent_activities.length > 0) {
      const activityData = [
        ['Recent Activity Log'],
        [],
        ['Task', 'Status', 'Priority', 'Project', 'Last Updated']
      ];
      
      analytics.recent_activities.forEach(activity => {
        activityData.push([
          activity.title || 'Untitled',
          activity.status || 'N/A',
          activity.priority || 'Medium',
          activity.project_name || 'N/A',
          activity.updated_at ? new Date(activity.updated_at).toLocaleString('en-US') : 'N/A'
        ]);
      });
      
      const ws6 = XLSX.utils.aoa_to_sheet(activityData);
      ws6['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 20 }];
      ws6['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
      
      XLSX.utils.book_append_sheet(wb, ws6, 'Recent Activity');
    }
    
    // Generate and download
    XLSX.writeFile(wb, `DOIT-Dashboard-Report-${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error('Failed to generate Excel: ' + error.message);
  }
};

/**
 * Export to CSV format
 */
export const exportToCSV = (analytics, userName) => {
  try {
    let csv = 'DOIT Dashboard Report\n';
    csv += `Generated for: ${userName}\n`;
    csv += `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
    
    csv += 'TASK STATISTICS\n';
    csv += 'Metric,Count\n';
    csv += `Total Tasks,${analytics.task_stats?.total || 0}\n`;
    csv += `Pending Tasks,${analytics.task_stats?.pending || 0}\n`;
    csv += `In Progress,${analytics.task_stats?.in_progress || 0}\n`;
    csv += `Completed Tasks,${analytics.task_stats?.closed || 0}\n`;
    csv += `Overdue Tasks,${analytics.task_stats?.overdue || 0}\n\n`;
    
    csv += 'PROJECT STATISTICS\n';
    csv += 'Metric,Count\n';
    csv += `Total Projects,${analytics.project_stats?.total || 0}\n`;
    csv += `Owned Projects,${analytics.project_stats?.owned || 0}\n`;
    csv += `Member Of,${analytics.project_stats?.member_of || 0}\n`;
    csv += `Active Projects,${analytics.project_stats?.active || 0}\n\n`;
    
    csv += 'PRIORITY DISTRIBUTION\n';
    csv += 'Priority,Count\n';
    csv += `High,${analytics.priority_distribution?.High || 0}\n`;
    csv += `Medium,${analytics.priority_distribution?.Medium || 0}\n`;
    csv += `Low,${analytics.priority_distribution?.Low || 0}\n\n`;
    
    if (analytics.status_distribution) {
      csv += 'STATUS DISTRIBUTION\n';
      csv += 'Status,Count\n';
      Object.entries(analytics.status_distribution).forEach(([status, count]) => {
        csv += `${status},${count}\n`;
      });
      csv += '\n';
    }
    
    if (analytics.upcoming_deadlines && analytics.upcoming_deadlines.length > 0) {
      csv += 'UPCOMING DEADLINES\n';
      csv += 'Task,Priority,Status,Due Date,Days Until,Project\n';
      analytics.upcoming_deadlines.forEach(task => {
        const daysText = task.days_until < 0 ? 
          `${Math.abs(task.days_until)} days overdue` : 
          `${task.days_until} days left`;
        csv += `"${task.title}",${task.priority},${task.status},${new Date(task.due_date).toLocaleDateString()},${daysText},"${task.project_name}"\n`;
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
    return true;
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw new Error('Failed to generate CSV: ' + error.message);
  }
};
