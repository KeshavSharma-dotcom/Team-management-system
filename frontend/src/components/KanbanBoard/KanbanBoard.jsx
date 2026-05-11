import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { apiCall } from '../../utils/api';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';
import './KanbanBoard.css';

const columns = ['To Do', 'In Progress', 'Review', 'Done'];

const KanbanBoard = ({ teamId, initialTasks, members, fetchTasks }) => {
    const [tasksByStatus, setTasksByStatus] = useState({
        'To Do': [], 'In Progress': [], 'Review': [], 'Done': []
    });

    useEffect(() => {
        const grouped = { 'To Do': [], 'In Progress': [], 'Review': [], 'Done': [] };
        initialTasks.forEach(task => {
            const status = task.status || 'To Do';
            if (grouped[status]) grouped[status].push(task);
            else grouped['To Do'].push(task);
        });
        setTasksByStatus(grouped);
    }, [initialTasks]);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceCol = source.droppableId;
        const destCol = destination.droppableId;
        
        const sourceTasks = Array.from(tasksByStatus[sourceCol]);
        const destTasks = sourceCol === destCol ? sourceTasks : Array.from(tasksByStatus[destCol]);
        
        const [movedTask] = sourceTasks.splice(source.index, 1);
        movedTask.status = destCol;
        destTasks.splice(destination.index, 0, movedTask);

        setTasksByStatus(prev => ({
            ...prev,
            [sourceCol]: sourceTasks,
            [destCol]: destTasks
        }));

        try {
            await apiCall(`/tasks/${draggableId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: destCol })
            });
            toast.success("Task moved successfully");
        } catch (err) {
            toast.error("Failed to update task");
            fetchTasks(); 
        }
    };

    const handleAssign = async (taskId, userId) => {
        try {
            await apiCall(`/tasks/${taskId}`, {
                method: 'PATCH',
                body: JSON.stringify({ assignee: userId })
            });
            toast.success("Assignee updated");
            fetchTasks();
        } catch (err) {
            toast.error("Failed to assign");
        }
    };

    return (
        <div className="kanban-container">
            <DragDropContext onDragEnd={onDragEnd}>
                {columns.map(colId => (
                    <div className="kanban-column-wrapper" key={colId}>
                        <div className="kanban-column-header">
                            <h3>{colId}</h3>
                            <span className="task-count">{tasksByStatus[colId].length}</span>
                        </div>
                        <Droppable droppableId={colId}>
                            {(provided, snapshot) => (
                                <div 
                                    className={`kanban-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {tasksByStatus[colId].map((task, index) => (
                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{...provided.draggableProps.style}}
                                                >
                                                    <h4 className="task-title">{task.title}</h4>
                                                    {task.description && <p className="task-desc">{task.description}</p>}
                                                    
                                                    <div className="task-meta">
                                                        {task.dueDate && (
                                                            <div className="task-due">
                                                                <Clock size={12} />
                                                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="task-assignee">
                                                            <select 
                                                                value={task.assignee?._id || ""}
                                                                onChange={(e) => handleAssign(task._id, e.target.value)}
                                                                className="assignee-select"
                                                                onPointerDown={(e) => e.stopPropagation()}
                                                            >
                                                                <option value="">Unassigned</option>
                                                                {members.map(m => (
                                                                    <option key={m.user._id} value={m.user._id}>
                                                                        {m.user.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;
