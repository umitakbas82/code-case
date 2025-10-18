import { TestBed } from '@angular/core/testing';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  let service: HistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TEST SENARYOSU 1
  it('should enable undo but disable redo after adding new states', () => {
    // Arrange
    const initialState = { version: '6.0.0', objects: [] };
    const nextState = { version: '6.0.0', objects: [{ type: 'rect' }] };

    // Act
    service.addState(initialState);
    service.addState(nextState);

    // Assert
    expect(service.undoStatus.getValue()).toBe(true);
    expect(service.redoStatus.getValue()).toBe(false);
  });

  // TEST SENARYOSU 2
  it('should return the previous state on undo', () => {
    // Arrange
    const initialState = { objects: [] };
    const nextState = { objects: [{ type: 'rect' }] };
    service.addState(initialState);
    service.addState(nextState);

    // Act
    const undoneState = service.undo();

    // Assert
    expect(undoneState).toEqual(initialState);
    expect(service.undoStatus.getValue()).toBe(false);
    expect(service.redoStatus.getValue()).toBe(true);
  });

  // TEST SENARYOSU 3
  it('should return the undone state on redo', () => {
    // Arrange
    const initialState = { objects: [] };
    const nextState = { objects: [{ type: 'rect' }] };
    service.addState(initialState);
    service.addState(nextState);
    service.undo();

    // Act
    const redoneState = service.redo();

    // Assert
    expect(redoneState).toEqual(nextState);
    expect(service.undoStatus.getValue()).toBe(true);
    expect(service.redoStatus.getValue()).toBe(false);
  });

  // TEST SENARYOSU 4
  it('should clear the redo history when a new state is added after an undo', () => {
    // Arrange
    const state1 = { objects: [] };
    const state2 = { objects: [{ type: 'rect' }] };
    const state3 = { objects: [{ type: 'rect' }, { type: 'circle' }] };
    const newStateAfterUndo = { objects: [{ type: 'polygon' }] };

    service.addState(state1);
    service.addState(state2);
    service.addState(state3);
    service.undo();

    // Act
    service.addState(newStateAfterUndo);

    // Assert
    const finalState = service.redo();
    expect(finalState).toBeNull();
    expect(service.redoStatus.getValue()).toBe(false);
  });
});