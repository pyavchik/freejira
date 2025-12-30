// Basic test to verify the backend structure
describe('Backend Structure', () => {
  test('should have project controller functions', async () => {
    const projectController = await import('../src/controllers/projectController.js');
    
    expect(projectController.createProject).toBeDefined();
    expect(projectController.getProjects).toBeDefined();
    expect(projectController.getProject).toBeDefined();
    expect(projectController.updateProject).toBeDefined();
    expect(projectController.deleteProject).toBeDefined();
  });
  
  test('should have epic controller functions', async () => {
    const epicController = await import('../src/controllers/epicController.js');
    
    expect(epicController.createEpic).toBeDefined();
    expect(epicController.getEpics).toBeDefined();
    expect(epicController.getEpic).toBeDefined();
    expect(epicController.updateEpic).toBeDefined();
    expect(epicController.deleteEpic).toBeDefined();
    expect(epicController.updateEpicPositions).toBeDefined();
  });
  
  test('should have epic routes properly configured', async () => {
    const epicRoutes = await import('../src/routes/epicRoutes.js');
    
    expect(epicRoutes.default).toBeDefined();
    expect(typeof epicRoutes.default).toBe('function');
  });
});