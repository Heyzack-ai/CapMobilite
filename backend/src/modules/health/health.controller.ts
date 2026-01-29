import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthStatus, ReadinessStatus } from './health.service';
import { Public } from '@common/decorators';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Basic health check (liveness)' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async health(): Promise<HealthStatus> {
    return this.healthService.getHealth();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Detailed readiness check' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready(): Promise<ReadinessStatus> {
    const status = await this.healthService.getReadiness();

    // Note: In a real implementation, you might want to return 503
    // for degraded/unhealthy status using a response interceptor
    return status;
  }
}
