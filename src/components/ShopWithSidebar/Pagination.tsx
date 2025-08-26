"use client";
import React from "react";

type PaginationProps = {
	currentPage: number;
	totalItems: number;
	pageSize?: number;
	onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalItems, pageSize = 9, onPageChange }: PaginationProps) {
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const canPrev = currentPage > 1;
	const canNext = currentPage < totalPages;

	function goTo(page: number) {
		if (page < 1 || page > totalPages) return;
		onPageChange(page);
	}

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

	return (
		<div className="flex justify-center mt-15">
			<div className="bg-white shadow-1 rounded-md p-2">
				<ul className="flex items-center gap-2">
					<li>
						<button
							id="paginationPrev"
							aria-label="button for pagination left"
							type="button"
							disabled={!canPrev}
							className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
							onClick={() => goTo(currentPage - 1)}
						>
							<svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z" fill="" />
							</svg>
						</button>
					</li>

					{pages.map((p) => (
						<li key={p}>
							<button
								type="button"
								className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${p === currentPage ? "bg-blue text-white" : "hover:text-white hover:bg-blue"}`}
								onClick={() => goTo(p)}
							>
								{p}
							</button>
						</li>
					))}

					<li>
						<button
							id="paginationNext"
							aria-label="button for pagination right"
							type="button"
							disabled={!canNext}
							className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
							onClick={() => goTo(currentPage + 1)}
						>
							<svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z" fill="" />
							</svg>
						</button>
					</li>
				</ul>
			</div>
		</div>
	);
} 