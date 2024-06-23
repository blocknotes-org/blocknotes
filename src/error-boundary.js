import React from 'react';

export class ErrorBoundary extends React.Component {
	componentDidCatch(error, errorInfo) {
		// eslint-disable-next-line no-alert
		window.alert(error, errorInfo);
		window.location.reload();
	}
	render() {
		return this.props.children;
	}
}
