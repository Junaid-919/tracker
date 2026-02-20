import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin, Table, Button, Card, Typography, Space, Tag, Alert, message } from 'antd';
import { ReloadOutlined, EnvironmentOutlined, NumberOutlined } from '@ant-design/icons';
// import "./bus.css";
// import "./busstop.css";

const { Title, Text } = Typography;

function BusStopScreen() {
  const [searchParams] = useSearchParams();
  const bus_stop_number = searchParams.get("bus_stop_number");

  const [busStop, setBusStop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const columns = [
    {
      title: 'Service Number',
      dataIndex: 'service_number',
      key: 'service_number',
      render: (text) => (
        <Tag color="blue" style={{ fontSize: '16px', fontWeight: 'bold', padding: '4px 12px' }}>
          {text || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Arrival Time',
      dataIndex: 'arrival_time',
      key: 'arrival_time',
      render: (text) => (
        <Space>
          <span style={{ fontSize: '15px' }}>{text || 'N/A'}</span>
          {text && <Tag color="green">Next</Tag>}
        </Space>
      ),
    },
    {
      title: 'Next Arrival',
      dataIndex: 'next_arrival_time',
      key: 'next_arrival_time',
      render: (text) => (
        <Text type={text ? "secondary" : "secondary"}>
          {text || 'No scheduled arrival'}
        </Text>
      ),
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      console.log("Fetching bus data...");
      setLoading(true);

      const response = await fetch(
        `https://backend-vercel-zeta-eight.vercel.app/api/busstops/number/${bus_stop_number}`
      );

      console.log("status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("data:", data);

      setBusStop(data);
      message.success('Bus data updated successfully');
    } catch (error) {
      console.error("Error fetching data:", error);
      setBusStop(null);
      message.error('Failed to fetch bus data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bus_stop_number) {
      fetchData();
    }
  }, [bus_stop_number]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size={isMobile ? "default" : "large"} />
        <Text type="secondary">Loading bus stop information...</Text>
      </div>
    );
  }

  if (!busStop) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="No Data Found"
          description="Unable to find information for this bus stop. Please try again later."
          type="info"
          showIcon
          action={
            <Button size="small" type="primary" onClick={fetchData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  console.log("API Response Structure:", Object.keys(busStop));
  
  const busServices = busStop.busService || busStop.services || busStop.buses || busStop.bussservice || [];

  return (
    <div style={{ 
      padding: isMobile ? '16px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header Section */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
                Bus Stop Details
              </Title>
              {busStop.name && (
                <Tag color="purple" style={{ marginLeft: '8px' }}>
                  {busStop.name}
                </Tag>
              )}
            </Space>
            
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              loading={loading}
            >
              Refresh Data
            </Button>
          </Space>

          {/* Bus Stop Information Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginTop: '24px'
          }}>
            <Card size="small" style={{ background: '#f5f5f5' }}>
              <Space>
                <NumberOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary">Stop Number:</Text>
                <Text strong>{bus_stop_number}</Text>
              </Space>
            </Card>

            {busStop.bus_stop_name && (
              <Card size="small" style={{ background: '#f5f5f5' }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary">Stop Name:</Text>
                  <Text strong>{busStop.bus_stop_name}</Text>
                </Space>
              </Card>
            )}
          </div>

          {busStop.description && (
            <Alert
              message="Description"
              description={busStop.description}
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}
        </Card>

        {/* Bus Services Section */}
        <Card 
          title={
            <Space>
              <span>Bus Services</span>
              <Tag color="blue">{busServices.length} services</Tag>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
          {busServices.length > 0 ? (
            <Table
              columns={columns}
              dataSource={busServices.map((service, index) => ({
                ...service,
                key: service.id || index,
              }))}
              pagination={false}
              size={isMobile ? "small" : "middle"}
              bordered
              style={{ 
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              scroll={{ x: 'max-content' }}
            />
          ) : (
            <Alert
              message="No Services Available"
              description="There are currently no bus services scheduled for this stop."
              type="warning"
              showIcon
            />
          )}
        </Card>

        {/* Last Updated Info */}
        <Text type="secondary" style={{ display: 'block', textAlign: 'right' }}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </Space>
    </div>
  );
}

export default BusStopScreen;