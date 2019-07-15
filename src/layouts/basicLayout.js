import React, { Suspense } from 'react';
import { Layout } from 'antd';
import DocumentTitle from 'react-document-title';
import SiderMenu from 'SiderMenu';
import logo from '@/assets/logo.png';
import getPageTitle from '@/utils/getPageTitle';
import inject from '@inject';
import Context from './menuContext';
import Footer from './footer';
import Header from './header';
import styles from './basicLayout.module.less';

// lazy load SettingDrawer
const SettingDrawer = React.lazy(() => import('@/components/SettingDrawer'));

const { Content } = Layout;

@inject('global', 'setting')
class BasicLayout extends React.Component {
	componentDidMount() {
		const { settingAction: { getSetting }, globalAction: { getMenuData }, route: { routes, path, authority } } = this.props; // eslint-disable-line
		getSetting();
		getMenuData({ routes, authority, path });
	}

	getLayoutStyle = () => {
		const { settingStore: { fixSiderbar, layout }, globalStore: { collapsed } } = this.props;
		if (fixSiderbar && layout !== 'topmenu') {
			return {
				paddingLeft: collapsed ? '80px' : '256px',
			};
		}
		return null;
	};

	getContext() {
		const { location, globalStore: { breadcrumbNameMap } } = this.props;
		return {
			location,
			breadcrumbNameMap
		};
	}

	renderSettingDrawer = () => {
		if (process.env.NODE_ENV !== 'development') {
			return null;
		}
		return <SettingDrawer />;
	};

	render() {
		const {
			children,
			location: { pathname },
			globalStore: {
				collapsed,
				menuData,
				breadcrumbNameMap
			},
			settingStore: {
				navTheme,
				fixedHeader,
				contentWidth,
				fixSiderbar,
				layout: PropsLayout,
			}
		} = this.props;
		const { changeLayoutCollapsed } = this.props.globalAction;
		const isTop = PropsLayout === 'topmenu';
		const contentStyle = !fixedHeader ? { paddingTop: 0 } : {};
		const layout = (
			<Layout>
				{
					isTop ? null : (<SiderMenu
						menuData={menuData}
						theme={navTheme}
						contentWidth={contentWidth}
						logo={logo}
						onCollapse={changeLayoutCollapsed}
						collapsed={collapsed}
						fixSiderbar={fixSiderbar}
						breadcrumbNameMap
						{...this.props}
					/>)
				}

				<Layout
					style={{
						...this.getLayoutStyle(),
						minHeight: '100vh',
					}}
				>
					<Header
						menuData={menuData}
						logo={logo}
						contentWidth={contentWidth}
						{...this.props}
					/>
					<Content className={styles.content} style={contentStyle}>
						{children}
					</Content>
					<Footer />
				</Layout>
			</Layout>
		);

		return (
			<React.Fragment>
				<DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
					<Context.Provider value={this.getContext()}>
						<div>{layout}</div>
					</Context.Provider>
				</DocumentTitle>
				<Suspense fallback={null}>{this.renderSettingDrawer()}</Suspense>
			</React.Fragment>
		);
	}
}

export default BasicLayout
