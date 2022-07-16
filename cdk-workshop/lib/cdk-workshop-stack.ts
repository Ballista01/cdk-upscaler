import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct, Node } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import * as path from 'path';
import { HitCounter } from './hitcounter';

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new NodejsFunction(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '../lambda/js/hello.js'),
      handler: 'handler',
    });

    const HelloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello,
    });

    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: HelloWithCounter.handler,
    });

    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: HelloWithCounter.table,
      sortBy: '-',
    });
  }
}
