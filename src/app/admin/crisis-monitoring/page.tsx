"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CrisisLogEntry } from "@/lib/crisis/types";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { reviewCrisisLog } from "./review-action";

type Stats = {
	total: number;
	unreviewed: number;
	falsePositiveRate: number;
};

export default function CrisisMonitoringPage() {
	const [recentLogs, setRecentLogs] = useState<CrisisLogEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState<Stats>({
		total: 0,
		unreviewed: 0,
		falsePositiveRate: 0,
	});
	const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
	const [reviewForm, setReviewForm] = useState({
		isFalsePositive: false,
		notes: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Compute stats from logs
	const computeStats = (logs: CrisisLogEntry[]): Stats => {
		const total = logs.length;
		const unreviewed = logs.filter((log) => !log.reviewed_at).length;
		const reviewed = logs.filter((log) => log.reviewed_at);
		const falsePositives = reviewed.filter((log) => log.is_false_positive).length;
		const falsePositiveRate =
			reviewed.length > 0 ? (falsePositives / reviewed.length) * 100 : 0;

		return { total, unreviewed, falsePositiveRate };
	};

	// Initial data fetch
	useEffect(() => {
		const fetchInitialData = async () => {
			const supabase = createClient();

			const { data, error } = await supabase
				.from("crisis_detection_logs")
				.select("*")
				.order("detected_at", { ascending: false })
				.limit(50);

			if (error) {
				console.error("Error fetching crisis logs:", error);
				setIsLoading(false);
				return;
			}

			const logs = (data || []) as CrisisLogEntry[];
			setRecentLogs(logs);
			setStats(computeStats(logs));
			setIsLoading(false);
		};

		fetchInitialData();
	}, []);

	// Real-time subscription
	useEffect(() => {
		const supabase = createClient();

		const channel = supabase
			.channel("crisis_detection_logs_changes")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "crisis_detection_logs",
				},
				(payload) => {
					const newLog = payload.new as CrisisLogEntry;
					setRecentLogs((prev) => {
						const updated = [newLog, ...prev];
						setStats(computeStats(updated));
						return updated;
					});
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "crisis_detection_logs",
				},
				(payload) => {
					const updatedLog = payload.new as CrisisLogEntry;
					setRecentLogs((prev) => {
						const updated = prev.map((log) =>
							log.id === updatedLog.id ? updatedLog : log,
						);
						setStats(computeStats(updated));
						return updated;
					});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	// Handle review form submission
	const handleReviewSubmit = async (logId: string) => {
		setIsSubmitting(true);
		const result = await reviewCrisisLog({
			logId,
			isFalsePositive: reviewForm.isFalsePositive,
			notes: reviewForm.notes || undefined,
		});

		if (result.success) {
			setExpandedLogId(null);
			setReviewForm({ isFalsePositive: false, notes: "" });
		} else {
			alert(`Error: ${result.error}`);
		}
		setIsSubmitting(false);
	};

	// Format date/time
	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	// Get severity badge color
	const getSeverityColor = (severity: string) => {
		return severity === "high" ? "bg-red-600" : "bg-yellow-600";
	};

	// Get review status badge
	const getReviewStatusBadge = (log: CrisisLogEntry) => {
		if (log.is_false_positive) {
			return (
				<span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-800">
					False Positive
				</span>
			);
		}
		if (log.reviewed_at) {
			return (
				<span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
					Reviewed
				</span>
			);
		}
		return (
			<span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
				Needs Review
			</span>
		);
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Crisis Detection Monitoring
					</h1>
					<p className="mt-2 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">
					Crisis Detection Monitoring
				</h1>
				<p className="mt-2 text-gray-600">
					Real-time monitoring of crisis keyword detections during screening.
					Review each event and mark false positives.
				</p>
			</div>

			{/* Stats Bar */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-gray-600">
							Total Detections
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-gray-900">{stats.total}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-gray-600">
							Needs Review
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div
							className={`text-3xl font-bold ${stats.unreviewed > 0 ? "text-red-600" : "text-green-600"}`}
						>
							{stats.unreviewed}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-gray-600">
							False Positive Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-gray-900">
							{stats.total > 0 && stats.falsePositiveRate > 0
								? `${stats.falsePositiveRate.toFixed(1)}%`
								: "N/A"}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Log List */}
			<div className="space-y-4">
				{recentLogs.length === 0 ? (
					<Card>
						<CardContent className="py-12 text-center">
							<p className="text-gray-500">
								No crisis detections recorded yet. Events will appear here in
								real-time.
							</p>
						</CardContent>
					</Card>
				) : (
					recentLogs.map((log) => (
						<Card
							key={log.id}
							className={`cursor-pointer transition-colors ${
								!log.reviewed_at ? "bg-red-50" : "bg-white"
							}`}
							onClick={() =>
								setExpandedLogId(expandedLogId === log.id ? null : log.id)
							}
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<CardTitle className="text-base">
												Crisis Detection Event
											</CardTitle>
											{getReviewStatusBadge(log)}
										</div>
										<CardDescription>
											{formatDateTime(log.detected_at)}
										</CardDescription>
									</div>
									<div className="flex flex-col items-end gap-2">
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${getSeverityColor(log.max_severity)}`}
										>
											{log.max_severity.toUpperCase()} Severity
										</span>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div>
										<h4 className="text-sm font-medium text-gray-700">
											Detected Keywords:
										</h4>
										<div className="mt-1 flex flex-wrap gap-2">
											{log.detected_keywords.map((keyword, idx) => {
												const severity = log.keyword_severities[idx];
												return (
													<span
														key={idx}
														className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${getSeverityColor(severity)}`}
													>
														{keyword}
													</span>
												);
											})}
										</div>
									</div>

									{/* Inline Review Form */}
									{expandedLogId === log.id && !log.reviewed_at && (
										<div
											className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-4"
											onClick={(e) => e.stopPropagation()}
										>
											<h4 className="font-medium text-gray-900">
												Review This Detection
											</h4>
											<div className="flex items-center gap-2">
												<input
													type="checkbox"
													id={`false-positive-${log.id}`}
													checked={reviewForm.isFalsePositive}
													onChange={(e) =>
														setReviewForm({
															...reviewForm,
															isFalsePositive: e.target.checked,
														})
													}
													className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
												/>
												<label
													htmlFor={`false-positive-${log.id}`}
													className="text-sm text-gray-700"
												>
													Mark as false positive
												</label>
											</div>
											<div>
												<label
													htmlFor={`notes-${log.id}`}
													className="block text-sm font-medium text-gray-700"
												>
													Review Notes (optional)
												</label>
												<textarea
													id={`notes-${log.id}`}
													value={reviewForm.notes}
													onChange={(e) =>
														setReviewForm({
															...reviewForm,
															notes: e.target.value,
														})
													}
													rows={3}
													className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
													placeholder="Add any notes about this detection..."
												/>
											</div>
											<button
												type="button"
												onClick={() => handleReviewSubmit(log.id)}
												disabled={isSubmitting}
												className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
											>
												{isSubmitting ? "Submitting..." : "Mark as Reviewed"}
											</button>
										</div>
									)}

									{/* Review Info (if already reviewed) */}
									{log.reviewed_at && (
										<div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
											<h4 className="font-medium text-gray-900">Review Details</h4>
											<dl className="mt-2 space-y-1 text-sm">
												<div>
													<dt className="inline font-medium text-gray-700">
														Reviewed at:
													</dt>{" "}
													<dd className="inline text-gray-600">
														{formatDateTime(log.reviewed_at)}
													</dd>
												</div>
												{log.review_notes && (
													<div>
														<dt className="inline font-medium text-gray-700">
															Notes:
														</dt>{" "}
														<dd className="inline text-gray-600">
															{log.review_notes}
														</dd>
													</div>
												)}
											</dl>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
