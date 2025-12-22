import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StaticSite } from './static-site';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class RsuTaxCalculatorCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'RsuTaxCalculatorCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    new StaticSite(this, 'StaticSite', {
      domainName: 'huhtanen.eu',
      siteSubDomain: 'tax-calculator',
      ecbDomain: 'data-api.ecb.europa.eu',
      ecbPath:'/service/data/EXR/D.USD.EUR.SP00.A',
      ecbParams:['startPeriod', 'format', 'detail'],
      sourcePath: this.node.tryGetContext('sourcePath')
    });
  }
}
