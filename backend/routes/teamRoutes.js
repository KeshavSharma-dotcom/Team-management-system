router.patch("/make-role", authenticateUser, makeRole)

router.post("/tasks", authenticateUser, createTask) 
router.patch("/tasks/:taskId/toggle", authenticateUser, toggleTaskStatus) 
router.post("/tasks/comment", authenticateUser, addComment) 
router.get("/:teamId/discuss", authenticateUser, getTeamDiscussions)
router.post("/discuss", authenticateUser, addTeamMessage)