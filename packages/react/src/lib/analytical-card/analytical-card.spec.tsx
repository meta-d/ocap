import { render } from '@testing-library/react';

import AnalyticalCard from './analytical-card';

describe('AnalyticalCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AnalyticalCard title={''} dataSettings={{dataSource: '', entitySet: ''}}/>);
    expect(baseElement).toBeTruthy();
  });
});
