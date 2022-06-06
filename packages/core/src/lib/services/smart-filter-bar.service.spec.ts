import { skip } from 'rxjs'
import { SmartFilterBarService } from './smart-filter-bar.service'

const aSlicer = {
  dimension: {
    dimension: 'Department'
  },
  members: [
    {
      value: 'A'
    }
  ]
}

describe('SmartFilterBarService', () => {
  let service: SmartFilterBarService

  beforeEach(() => {
    service = new SmartFilterBarService()
  })

  afterEach(() => {
    service.onDestroy()
  })

  it('#should be created', () => {
    expect(service).toBeTruthy()
  })

  it('#Not go', (done) => {
    service.onChange().subscribe((slicers) => {
      expect(slicers).toEqual([])
      done()
    })

    service.change([aSlicer])
  })

  it('#Go after query', (done) => {
    service
      .onChange()
      .pipe(skip(1))
      .subscribe((slicers) => {
        expect(slicers).toEqual([aSlicer])
        done()
      })

    service.change([aSlicer])
    service.go()
  })

  it('#Go before query', (done) => {
    service.change([aSlicer])
    service.go()

    service.onChange().subscribe((slicers) => {
      expect(slicers).toEqual([aSlicer])
      done()
    })
  })

  it('#Put Slicer', (done) => {
    service.put(aSlicer)
    service.put(aSlicer)
    service.go()

    service.onChange().subscribe((slicers) => {
      expect(slicers).toEqual([aSlicer])
      done()
    })
  })

  it('#Remove Slicer', (done) => {
    service.put(aSlicer)
    service.remove(aSlicer)
    service.go()
    
    service.onChange().subscribe((slicers) => {
      expect(slicers).toEqual([])
      done()
    })
  })
})

describe('SmartFilterBarService with Parent', () => {
  let service: SmartFilterBarService
  let parent: SmartFilterBarService

  beforeEach(() => {
    parent = new SmartFilterBarService()
    service = new SmartFilterBarService(parent)
  })

  afterEach(() => {
    parent.onDestroy()
    service.onDestroy()
  })

  it('#should be created', () => {
    expect(parent).toBeTruthy()
    expect(service).toBeTruthy()
  })

  it('#Go on parent', (done) => {
    parent.change([aSlicer])
    parent.go()
    service.onChange().subscribe((slicers) => {
      expect(slicers).toEqual([aSlicer])
      done()
    })
  })

  it('#Go on parent and Slicers on child', (done) => {
    service.change([aSlicer])
    parent.go()
    service.onChange().subscribe((slicers) => {
      expect(slicers).toEqual([aSlicer])
      done()
    })
  })
})
