import { ModelsService } from "@metad/cloud/state";
import { SemanticModelService } from "./model.service";

// Straight Jasmine testing without Angular's testing support
describe('ModelService', () => {
    let service: SemanticModelService;
    beforeEach(() => { service = new SemanticModelService(new ModelsService()); });
  
    it('#getValue should return real value', () => {
      expect(service.getValue()).toBe('real value');
    });
  
    it('#getObservableValue should return value from observable',
      (done: DoneFn) => {
      service.getObservableValue().subscribe(value => {
        expect(value).toBe('observable value');
        done();
      });
    });
  
    it('#getPromiseValue should return value from a promise',
      (done: DoneFn) => {
      service.getPromiseValue().then(value => {
        expect(value).toBe('promise value');
        done();
      });
    });
  });