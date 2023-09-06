export interface NxPaging {
    paging: boolean
    pageNo: number
    pageSize: number
    /**
     * Returns the total number of records.
     * @remarks
     * Only functions when paging is enabled.
     * @example
     * ```typescript
     * const totalRecords = this.grid.totalRecords;
     * ```
     */
    totalRecords: number
    /**
     * Returns if the current page is the last page.
     * @example
     * ```typescript
     * const lastPage = this.grid.isLastPage;
     * ```
     */
    isLastPage: boolean

    /**
     * Gets if the current page is the first page.
     * @example
     * ```typescript
     * const firstPage = this.grid.isFirstPage;
     * ```
     */
    isFirstPage: boolean

    /**
     * Goes to the desired page index.
     * @example
     * ```typescript
     * this.grid1.paginate(1);
     * ```
     * @param val
     */
    paginate(val: number): void
    /**
     * Goes to the previous page, if the grid is not already at the first page.
     * @example
     * ```typescript
     * this.grid1.previousPage();
     * ```
     */
    previousPage(): void

    /**
     * Goes to the next page, if the grid is not already at the last page.
     * @example
     * ```typescript
     * this.grid1.nextPage();
     * ```
     */
    nextPage(): void

}
